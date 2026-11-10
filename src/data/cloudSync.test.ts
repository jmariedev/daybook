import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CardRow } from './cloudRows';
import { CloudSync } from './cloudSync';
import type { Persistence } from './persistence';
import { DaybookStore } from './store';

const list = (name: string) => Array.from({ length: 12 }, (_, i) => `${name} ${i}`);
const bank = {
  gratitude: list('g'),
  reflection: list('r'),
  creative: list('c'),
  story: list('s'),
};
const browserOnly: Persistence = { load: () => null, save: () => undefined };
const today = () => '2026-11-04';

/** A small in-memory stand-in for the parts of Supabase that sync uses. */
function fakeClient(start: { rows?: CardRow[]; progress?: object | null } = {}) {
  const db = {
    rows: new Map((start.rows ?? []).map((row) => [row.id, row])),
    progress: start.progress ?? null,
    writes: 0,
  };
  let authListener: (event: string, session: unknown) => void = () => undefined;

  const client = {
    auth: {
      onAuthStateChange(listener: typeof authListener) {
        authListener = listener;
      },
      signOut: async () => authListener('SIGNED_OUT', null),
    },
    from(table: string) {
      if (table === 'daybook_progress') {
        return {
          select: () => ({ maybeSingle: async () => ({ data: db.progress, error: null }) }),
          upsert: async (row: object) => {
            db.progress = row;
            db.writes++;
            return { error: null };
          },
        };
      }
      return {
        select: () => {
          const query = {
            order: () => query,
            range: async (from: number, to: number) => ({
              data: [...db.rows.values()]
                .sort((a, b) => b.position - a.position)
                .slice(from, to + 1),
              error: null,
            }),
          };
          return query;
        },
        upsert: async (rows: CardRow[]) => {
          rows.forEach((row) => db.rows.set(row.id, row));
          db.writes++;
          return { error: null };
        },
        delete: () => ({
          in: async (_column: string, ids: string[]) => {
            ids.forEach((id) => db.rows.delete(id));
            db.writes++;
            return { error: null };
          },
        }),
      };
    },
  };

  return {
    db,
    client: client as unknown as SupabaseClient,
    signIn: () => authListener('SIGNED_IN', { user: { id: 'user-1', email: 'a@example.com' } }),
    signOutEvent: () => authListener('SIGNED_OUT', null),
  };
}

const settle = async () => {
  await vi.advanceTimersByTimeAsync(2000);
};

describe('CloudSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('document', { addEventListener: () => undefined, visibilityState: 'visible' });
  });

  it('uploads browser progress to a new account', async () => {
    const fake = fakeClient();
    const store = new DaybookStore(browserOnly, bank, today);
    store.actOnTopCard();
    new CloudSync(store, fake.client);

    fake.signIn();
    await settle();

    expect(fake.db.rows.size).toBe(16);
    expect([...fake.db.rows.values()].filter((row) => row.done_on)).toHaveLength(1);
    expect(fake.db.progress).toMatchObject({ user_id: 'user-1', last_deal: '2026-11-04' });
  });

  it('loads an existing account instead of overwriting it', async () => {
    const fake = fakeClient({
      rows: [
        {
          id: 'mine',
          category: 'story',
          prompt: 'my prompt',
          added_on: '2026-11-04',
          done_on: null,
          position: 0,
        },
      ],
      progress: { dealt: { 0: 5, 1: 5, 2: 5, 3: 5 }, last_deal: '2026-11-04' },
    });
    const store = new DaybookStore(browserOnly, bank, today);
    new CloudSync(store, fake.client);

    fake.signIn();
    await settle();

    expect(store.getSnapshot().stacks[3].map((c) => c.text)).toEqual(['my prompt']);
    expect(store.getSnapshot().stacks[0]).toEqual([]);
    expect(fake.db.rows.size).toBe(1);
    expect(fake.db.writes).toBe(0);
  });

  it('saves changes after loading, and writes only what changed', async () => {
    const fake = fakeClient();
    const store = new DaybookStore(browserOnly, bank, today);
    new CloudSync(store, fake.client);
    fake.signIn();
    await settle();
    fake.db.writes = 0;

    const top = store.getSnapshot().stacks[0][0];
    store.actOnTopCard();
    await settle();

    expect(fake.db.rows.get(top.id)?.done_on).toBe('2026-11-04');
    expect(fake.db.writes).toBe(2);
  });

  it('does not save anything while signed out', async () => {
    const fake = fakeClient();
    const store = new DaybookStore(browserOnly, bank, today);
    new CloudSync(store, fake.client);

    store.actOnTopCard();
    await settle();

    expect(fake.db.writes).toBe(0);
  });

  it('clears the account from this browser on sign-out', async () => {
    const fake = fakeClient();
    const store = new DaybookStore(browserOnly, bank, today);
    new CloudSync(store, fake.client);
    fake.signIn();
    await settle();
    store.actOnTopCard();
    await settle();

    fake.signOutEvent();
    await settle();

    expect(store.getSnapshot().stacks[4]).toEqual([]);
    expect(fake.db.rows.size).toBe(16);
  });
});

describe('password accounts', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: 'https://example.test' } });
    vi.stubGlobal('document', { addEventListener: () => undefined, visibilityState: 'visible' });
  });

  function passwordClient(signUpData: object, updateError: object | null = null) {
    let listener: (event: string, session: unknown) => void = () => undefined;
    const client = {
      auth: {
        onAuthStateChange(next: typeof listener) {
          listener = next;
        },
        signUp: async () => ({ data: signUpData, error: null }),
        updateUser: async () => ({ error: updateError }),
      },
    };
    const store = new DaybookStore(browserOnly, bank, today);
    return {
      cloud: new CloudSync(store, client as unknown as SupabaseClient),
      emit: (event: string) => listener(event, null),
    };
  }

  it('reads what happened when signing up', async () => {
    const session = { session: {}, user: { identities: [{}] } };
    const confirm = { session: null, user: { identities: [{}] } };
    const taken = { session: null, user: { identities: [] } };
    expect(await passwordClient(session).cloud.signUp('a@b.co', 'password')).toBe('signedIn');
    expect(await passwordClient(confirm).cloud.signUp('a@b.co', 'password')).toBe('confirmEmail');
    expect(await passwordClient(taken).cloud.signUp('a@b.co', 'password')).toBe('alreadyExists');
  });

  it('stays in recovery until a new password is saved', async () => {
    const { cloud, emit } = passwordClient({});
    expect(cloud.getSnapshot().recovering).toBe(false);
    emit('PASSWORD_RECOVERY');
    expect(cloud.getSnapshot().recovering).toBe(true);
    await cloud.setPassword('a-new-password');
    expect(cloud.getSnapshot().recovering).toBe(false);
  });

  it('stays in recovery if the new password is refused', async () => {
    const { cloud, emit } = passwordClient({}, new Error('weak'));
    emit('PASSWORD_RECOVERY');
    await expect(cloud.setPassword('short')).rejects.toThrow('weak');
    expect(cloud.getSnapshot().recovering).toBe(true);
  });
});
