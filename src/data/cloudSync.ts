import type { SupabaseClient } from '@supabase/supabase-js';
import { cardsToRows, diffRows, rowsToCards } from './cloudRows';
import type { CardRow } from './cloudRows';
import type { DaybookStore } from './store';

const CARDS = 'daybook_cards';
const PROGRESS = 'daybook_progress';
const SAVE_DELAY_MS = 700;
const PAGE_SIZE = 1000;

export type SyncStatus = 'signedOut' | 'loading' | 'saved' | 'saving' | 'error';

export interface CloudState {
  email: string | null;
  status: SyncStatus;
  /** True after opening a password reset link, until a new password is saved. */
  recovering: boolean;
}

export type SignUpResult = 'signedIn' | 'confirmEmail' | 'alreadyExists';

/**
 * Keeps the store and Supabase in step for a signed-in person. The first time an
 * account has no cards, the browser's progress is uploaded. After that, the
 * account's copy is loaded on sign-in and whenever the app regains focus.
 */
export class CloudSync {
  private state: CloudState = { email: null, status: 'signedOut', recovering: false };
  private listeners = new Set<() => void>();
  private userId: string | null = null;
  private savedRows = new Map<string, CardRow>();
  private savedProgress = '';
  /** Saving waits until the account's copy has loaded, so it cannot be overwritten. */
  private loaded = false;
  private applyingRemote = false;
  private saveTimer: ReturnType<typeof setTimeout> | undefined;
  private saving: Promise<void> = Promise.resolve();

  constructor(
    private store: DaybookStore,
    private client: SupabaseClient,
  ) {
    store.subscribe(() => {
      if (!this.applyingRemote) this.queueSave();
    });

    client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') this.setState({ recovering: true });
      // Supabase asks that its own calls wait until this callback has returned.
      setTimeout(() => this.handleSession(session?.user ?? null), 0);
    });

    document.addEventListener('visibilitychange', () => {
      if (!this.userId) return;
      if (document.visibilityState === 'hidden') void this.saveNow();
      else if (!this.saveTimer) void this.load();
    });
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  async signIn(email: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signUp(email: string, password: string): Promise<SignUpResult> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    if (data.session) return 'signedIn';
    // Supabase hides whether an email is registered: a taken one comes back with no identities.
    return data.user?.identities?.length ? 'confirmEmail' : 'alreadyExists';
  }

  async sendPasswordReset(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  }

  async setPassword(password: string) {
    const { error } = await this.client.auth.updateUser({ password });
    if (error) throw error;
    this.setState({ recovering: false });
  }

  async sendSignInLink(email: string) {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  }

  /**
   * If this page was opened from a sign-in link that no longer works, returns why and
   * tidies the address. Supabase reports these in the part of the address after the #.
   */
  takeLinkProblem() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (!params.get('error')) return null;
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return params.get('error_code') === 'otp_expired'
      ? 'That sign-in link has expired or was already used. Enter your email for a new one.'
      : 'That sign-in link did not work. Enter your email for a new one.';
  }

  async signOut() {
    await this.saveNow();
    await this.client.auth.signOut();
  }

  private setState(next: Partial<CloudState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((listener) => listener());
  }

  private handleSession(user: { id: string; email?: string } | null) {
    if (user?.id === (this.userId ?? undefined)) return;

    const wasSignedIn = Boolean(this.userId);
    this.userId = user?.id ?? null;
    this.loaded = false;
    this.savedRows = new Map();
    this.savedProgress = '';
    clearTimeout(this.saveTimer);
    this.saveTimer = undefined;

    if (user) {
      this.setState({ email: user.email ?? null, status: 'loading' });
      void this.load();
    } else {
      this.setState({ email: null, status: 'signedOut' });
      // Leave nothing of this account behind on a shared computer.
      if (wasSignedIn) this.applyRemote(null);
    }
  }

  private applyRemote(state: Parameters<DaybookStore['replaceState']>[0]) {
    this.applyingRemote = true;
    this.store.replaceState(state);
    this.applyingRemote = false;
  }

  private async fetchAllRows() {
    const rows: CardRow[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await this.client
        .from(CARDS)
        .select('id,category,prompt,added_on,done_on,position')
        .order('position', { ascending: false })
        .order('id')
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      rows.push(...(data as CardRow[]));
      if (data.length < PAGE_SIZE) return rows;
    }
  }

  private async load() {
    const userId = this.userId;
    try {
      const rows = await this.fetchAllRows();
      const { data: progress, error } = await this.client
        .from(PROGRESS)
        .select('dealt,last_deal')
        .maybeSingle();
      if (error) throw error;
      if (userId !== this.userId) return;

      this.savedRows = new Map(rows.map((row) => [row.id, row]));
      this.savedProgress = progress ? JSON.stringify([progress.dealt, progress.last_deal]) : '';

      if (rows.length) {
        this.applyRemote({
          cards: rowsToCards(rows),
          dealt: progress?.dealt ?? {},
          lastDeal: progress?.last_deal ?? undefined,
        });
      }
      this.loaded = true;
      this.setState({ status: 'saved' });
      // Uploads the browser's cards to a new account, or a card dealt just now.
      await this.saveNow();
    } catch (error) {
      console.error('Could not load from Supabase', error);
      if (userId === this.userId) this.setState({ status: 'error' });
    }
  }

  private queueSave() {
    if (!this.userId || !this.loaded) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = undefined;
      void this.saveNow();
    }, SAVE_DELAY_MS);
  }

  /** Runs one save at a time, so an older save cannot finish after a newer one. */
  private saveNow() {
    clearTimeout(this.saveTimer);
    this.saveTimer = undefined;
    this.saving = this.saving.then(() => this.pushChanges());
    return this.saving;
  }

  private async pushChanges() {
    const userId = this.userId;
    if (!userId || !this.loaded) return;

    const rows = cardsToRows(this.store.getSnapshot().stacks);
    const { upserts, deletes } = diffRows(this.savedRows, rows);
    const { dealt, lastDeal } = this.store.getProgress();
    const progress = JSON.stringify([dealt, lastDeal]);
    if (!upserts.length && !deletes.length && progress === this.savedProgress) return;

    this.setState({ status: 'saving' });
    try {
      if (upserts.length) {
        const { error } = await this.client
          .from(CARDS)
          .upsert(upserts.map((row) => ({ ...row, user_id: userId })));
        if (error) throw error;
      }
      if (deletes.length) {
        const { error } = await this.client.from(CARDS).delete().in('id', deletes);
        if (error) throw error;
      }
      const { error } = await this.client
        .from(PROGRESS)
        .upsert({ user_id: userId, dealt, last_deal: lastDeal });
      if (error) throw error;

      if (userId !== this.userId) return;
      this.savedRows = new Map(rows.map((row) => [row.id, row]));
      this.savedProgress = progress;
      this.setState({ status: 'saved' });
    } catch (error) {
      console.error('Could not save to Supabase', error);
      if (userId === this.userId) this.setState({ status: 'error' });
    }
  }
}
