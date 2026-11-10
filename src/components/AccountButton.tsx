import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { FormEvent } from 'react';
import type { CloudSync, SyncStatus } from '../data/cloudSync';
import { useSoundPreference } from '../sound/soundPreference';
import { CloseIcon, PersonIcon } from './Icons';

type Mode = 'signIn' | 'signUp' | 'link' | 'reset';
type Sent = { kind: 'link' | 'confirm' | 'reset'; to: string };

const MIN_PASSWORD = 8;

const STATUS_TEXT: Record<SyncStatus, string> = {
  signedOut: '',
  loading: 'Loading your cards.',
  saving: 'Saving your cards.',
  saved: 'Your cards are saved to your account.',
  error: 'Could not reach your account. Your cards are safe here, and Daybook will try again.',
};

const SENT_TEXT: Record<Sent['kind'], { title: string; before: string; after: string }> = {
  link: {
    title: 'Check your email',
    before: 'We sent a sign-in link to',
    after: 'Open it on this device to continue.',
  },
  confirm: {
    title: 'Confirm your email',
    before: 'We sent a confirmation link to',
    after: 'Open it to finish creating your account.',
  },
  reset: {
    title: 'Check your email',
    before: 'If there is an account for',
    after: 'a link to choose a new password is on its way.',
  },
};

const FORM_TEXT: Record<Mode, { title: string; intro: string; action: string; busy: string }> = {
  signIn: {
    title: 'Welcome back',
    intro:
      'Sign in to save your cards. Without an account, they stay only in this browser and can be lost.',
    action: 'Sign in',
    busy: 'Signing in',
  },
  signUp: {
    title: 'Keep your cards',
    intro:
      'Create an account to save your progress and use it on any device. Without one, your cards stay only in this browser and can be lost.',
    action: 'Create account',
    busy: 'Creating',
  },
  link: {
    title: 'Sign in with a link',
    intro: 'No password needed. We will email you a link that signs you in.',
    action: 'Email me a link',
    busy: 'Sending',
  },
  reset: {
    title: 'Forgot your password?',
    intro: 'We will email you a link to choose a new one.',
    action: 'Send reset link',
    busy: 'Sending',
  },
};

function authProblem(caught: unknown) {
  const { code, status } = caught as { code?: string; status?: number };
  if (code === 'invalid_credentials') {
    return 'That email and password do not match. If you always used an emailed link, choose Forgot password to set one.';
  }
  if (code === 'email_not_confirmed') {
    return 'Please confirm your email first. Open the link we sent you, then sign in.';
  }
  if (code === 'weak_password') {
    return 'Please choose a stronger password.';
  }
  if (code === 'same_password') {
    return 'That is already your password. Please choose a new one.';
  }
  if (status === 429) {
    return 'Too many tries just now. Please wait a little and try again.';
  }
  return 'That did not work. Check your connection and try again in a minute.';
}

function PasswordField({
  id,
  label,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label?: string;
  autoComplete: 'current-password' | 'new-password';
  value: string;
  onChange: (value: string) => void;
}) {
  const [shown, setShown] = useState(false);
  const isNew = autoComplete === 'new-password';
  return (
    <>
      {label && <label htmlFor={id}>{label}</label>}
      <div className="password-field">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          minLength={isNew ? MIN_PASSWORD : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          aria-pressed={shown}
          aria-label={shown ? 'Hide password' : 'Show password'}
          onClick={() => setShown((current) => !current)}
        >
          {shown ? 'Hide' : 'Show'}
        </button>
      </div>
      {isNew && <small className="field-hint">At least {MIN_PASSWORD} characters.</small>}
    </>
  );
}

export function AccountButton({ cloud }: { cloud: CloudSync }) {
  const { email, status, recovering } = useSyncExternalStore(cloud.subscribe, cloud.getSnapshot);
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>('signIn');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState<Sent | null>(null);
  const [settingPassword, setSettingPassword] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useSoundPreference();

  const close = () => dialog.current?.close();

  const switchMode = (next: Mode) => {
    setMode(next);
    setPassword('');
    setError('');
  };

  const attempt = async (action: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (caught) {
      setError(authProblem(caught));
    } finally {
      setBusy(false);
    }
  };

  // A link from an old email lands here: open the form and explain, instead of doing nothing.
  useEffect(() => {
    const problem = cloud.takeLinkProblem();
    if (!problem) return;
    setMode('link');
    setError(problem);
    dialog.current?.showModal();
  }, [cloud]);

  // A password reset link lands here: ask for the new password right away.
  useEffect(() => {
    if (recovering && !dialog.current?.open) dialog.current?.showModal();
  }, [recovering]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const to = address.trim();
    void attempt(async () => {
      if (mode === 'signIn') {
        await cloud.signIn(to, password);
        setPassword('');
        close();
      } else if (mode === 'signUp') {
        const result = await cloud.signUp(to, password);
        setPassword('');
        if (result === 'signedIn') close();
        else if (result === 'confirmEmail') setSent({ kind: 'confirm', to });
        else {
          setMode('signIn');
          setError('That email already has an account. Please sign in instead.');
        }
      } else if (mode === 'link') {
        await cloud.sendSignInLink(to);
        setSent({ kind: 'link', to });
      } else {
        await cloud.sendPasswordReset(to);
        setSent({ kind: 'reset', to });
      }
    });
  };

  const savePassword = (event: FormEvent) => {
    event.preventDefault();
    void attempt(async () => {
      await cloud.setPassword(password);
      setPassword('');
      setSettingPassword(false);
      setNotice('Your password is saved.');
    });
  };

  const signOut = () =>
    attempt(async () => {
      await cloud.signOut();
      setSent(null);
      setNotice('');
      setMode('signIn');
      close();
    });

  const label = email ? 'Account' : 'Sign in to save your cards';
  const form = FORM_TEXT[mode];
  const choosingPassword = Boolean(email) && (recovering || settingPassword);
  const errorMessage = error && (
    <p className="account-error" role="alert">
      {error}
    </p>
  );

  return (
    <>
      <button
        type="button"
        className="account-button"
        title={label}
        aria-label={label}
        onClick={() => dialog.current?.showModal()}
      >
        <PersonIcon />
        <span>{email ? 'Account' : 'Sign in'}</span>
      </button>

      <dialog className="account-dialog" ref={dialog}>
        {!recovering && (
          <button
            type="button"
            className="how-to-close"
            aria-label="Close"
            title="Close"
            onClick={close}
          >
            <CloseIcon />
          </button>
        )}
        {choosingPassword ? (
          <form onSubmit={savePassword}>
            <h2>Choose a password</h2>
            <p>
              For <strong>{email}</strong>. You can use it to sign in on any device.
            </p>
            <PasswordField
              id="account-new-password"
              label="New password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
            />
            {errorMessage}
            <div className="account-row">
              {!recovering && (
                <button type="button" onClick={() => setSettingPassword(false)}>
                  Cancel
                </button>
              )}
              <button type="submit" className="account-primary" disabled={busy}>
                {busy ? 'Saving' : 'Save password'}
              </button>
            </div>
          </form>
        ) : email ? (
          <>
            <h2>Your account</h2>
            <p>
              Signed in as <strong>{email}</strong>. {STATUS_TEXT[status]}
            </p>
            {notice && <p role="status">{notice}</p>}
            {errorMessage}
            <div className="account-row">
              <button
                type="button"
                className="text-link account-secondary"
                onClick={() => {
                  setNotice('');
                  setError('');
                  setSettingPassword(true);
                }}
              >
                Set a password
              </button>
              <button type="button" onClick={close}>
                Close
              </button>
              <button type="button" className="account-primary" disabled={busy} onClick={signOut}>
                Sign out
              </button>
            </div>
          </>
        ) : sent ? (
          <>
            <h2>{SENT_TEXT[sent.kind].title}</h2>
            <p>
              {SENT_TEXT[sent.kind].before} <strong>{sent.to}</strong>
              {sent.kind === 'reset' ? ', ' : '. '}
              {SENT_TEXT[sent.kind].after}
            </p>
            <div className="account-row">
              <button
                type="button"
                onClick={() => {
                  setSent(null);
                  switchMode('signIn');
                }}
              >
                Back to sign in
              </button>
              <button type="button" className="account-primary" onClick={close}>
                Done
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <h2>{form.title}</h2>
            <p>{form.intro}</p>
            <label htmlFor="account-email">Email</label>
            <input
              id="account-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
            {mode === 'signIn' && (
              <>
                <div className="label-row">
                  <label htmlFor="account-password">Password</label>
                  <button type="button" className="text-link" onClick={() => switchMode('reset')}>
                    Forgot password?
                  </button>
                </div>
                <PasswordField
                  id="account-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={setPassword}
                />
              </>
            )}
            {mode === 'signUp' && (
              <>
                <div className="label-row">
                  <label htmlFor="account-password">Password</label>
                </div>
                <PasswordField
                  id="account-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={setPassword}
                />
              </>
            )}
            {errorMessage}
            <div className="account-row">
              <button type="button" onClick={close}>
                Not now
              </button>
              <button type="submit" className="account-primary" disabled={busy}>
                {busy ? form.busy : form.action}
              </button>
            </div>
            <div className="account-switch">
              {mode === 'signIn' ? (
                <>
                  <button type="button" className="text-link" onClick={() => switchMode('signUp')}>
                    Create an account
                  </button>
                  <button type="button" className="text-link" onClick={() => switchMode('link')}>
                    Email me a link instead
                  </button>
                </>
              ) : (
                <button type="button" className="text-link" onClick={() => switchMode('signIn')}>
                  Back to sign in
                </button>
              )}
            </div>
          </form>
        )}

        <label className="setting-row" htmlFor="sound-setting">
          <span>
            <b>Sound</b>
            <small>Soft sounds when cards flip and shuffle.</small>
          </span>
          <input
            id="sound-setting"
            type="checkbox"
            role="switch"
            checked={soundOn}
            onChange={(event) => setSoundOn(event.target.checked)}
          />
        </label>
      </dialog>
    </>
  );
}
