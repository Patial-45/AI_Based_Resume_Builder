import { useState, useRef } from 'react';
import { useAuth } from '../context/auth';
import { api, errorMessage, setCsrfToken } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import UnsavedChanges from '../components/UnsavedChanges';
export default function Profile() {
  const recoveryButton = useRef<HTMLButtonElement>(null);
  const { user, setUser } = useAuth();
  const initial = { name: user?.name || '', jobTitle: user?.preferences?.jobTitle || '', location: user?.preferences?.location || '', remote: user?.preferences?.remote || false, minSalary: user?.preferences?.minSalary?.toString() || '', maxSalary: user?.preferences?.maxSalary?.toString() || '' };
  const [values, setValues] = useState(initial), [saved, setSaved] = useState(initial);
  const [tab, setTab] = useState<'profile' | 'security'>('profile');
  const [current, setCurrent] = useState(''), [password, setPassword] = useState('');
  const [busy, setBusy] = useState(''), [status, setStatus] = useState(''), [error, setError] = useState('');
  const [securityFeedback, setSecurityFeedback] = useState<{ action: 'password' | 'recovery'; message: string; error: boolean } | null>(null);
  const [code, setCode] = useState('');
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const field = (key: keyof typeof values, value: string | boolean) => { setValues(v => ({ ...v, [key]: value })); setStatus(''); };
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy('profile'); setStatus(''); setError('');
    try {
      const { name, ...preferences } = values;
      const response = await api.put('/auth/profile', { name, preferences: { ...preferences,
        minSalary: preferences.minSalary === '' ? null : Number(preferences.minSalary),
        maxSalary: preferences.maxSalary === '' ? null : Number(preferences.maxSalary) } });
      const confirmed = { ...values, name: response.data.name };
      setUser(response.data); setValues(confirmed); setSaved(confirmed); setStatus('Profile saved.');
    } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(''); }
  }
  async function security(action: 'password' | 'recovery') {
    setSecurityFeedback(null);
    if (!current) { setSecurityFeedback({ action, message: 'Enter your current password to continue.', error: true }); return; }
    setBusy(action);
    try {
      if (action === 'password') {
        const { data } = await api.put('/auth/password', { currentPassword: current, newPassword: password }, { timeout: 20000 });
        setCsrfToken(data.csrfToken);
        const { csrfToken: unused, ...account } = data; void unused;
        setUser(account); setPassword(''); setSecurityFeedback({ action, message: 'Password changed. Other sessions have been signed out.', error: false });
      } else setCode((await api.post('/auth/recovery-code', { password: current }, { timeout: 20000 })).data.recoveryCode);
      setCurrent('');
    } catch (cause) { setSecurityFeedback({ action, message: errorMessage(cause), error: true }); } finally { setBusy(''); }
  }
  function tabKeys(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === 'Home' ? 'profile' : event.key === 'End' ? 'security' : tab === 'profile' ? 'security' : 'profile';
    setTab(target); document.getElementById('settings-tab-' + target)?.focus();
  }
  return <section className="settings-page">
    <UnsavedChanges dirty={dirty || !!current || !!password} />
    <div className="page-heading"><h1>Account settings</h1><p>Manage your profile, preferences and security.</p></div>
    <div role="tablist" aria-label="Account settings sections" className="workspace-tabs">
      {(['profile', 'security'] as const).map(value => <button key={value} type="button" id={'settings-tab-' + value} role="tab" aria-selected={tab === value} aria-controls={'settings-panel-' + value} tabIndex={tab === value ? 0 : -1} onKeyDown={tabKeys} onClick={() => setTab(value)}>{value === 'profile' ? 'Profile & preferences' : 'Security'}</button>)}
    </div>
    <div role="tabpanel" id="settings-panel-profile" aria-labelledby="settings-tab-profile" hidden={tab !== 'profile'}>
      <form onSubmit={save} className="card settings-form">
        <fieldset disabled={!!busy}>
          <section className="form-section"><h2>Profile</h2><div className="form-grid">
            <Input label="Full name" maxLength={100} autoComplete="name" value={values.name} onChange={e => field('name', e.target.value)} required />
            <Input label="Email address" value={user?.email || ''} readOnly helperText="Email changes are not available yet." />
          </div></section>
          <section className="form-section"><h2>Job preferences</h2><div className="form-grid">
            <Input label="Preferred job title" maxLength={120} value={values.jobTitle} onChange={e => field('jobTitle', e.target.value)} />
            <Input label="Preferred location" maxLength={120} value={values.location} onChange={e => field('location', e.target.value)} />
            <Input label="Minimum annual salary" type="number" min={0} max={1000000000} step={1} value={values.minSalary} onChange={e => field('minSalary', e.target.value)} />
            <Input label="Maximum annual salary" type="number" min={0} max={1000000000} step={1} value={values.maxSalary} onChange={e => field('maxSalary', e.target.value)} />
          </div><label className="form-check"><input type="checkbox" checked={values.remote} onChange={e => field('remote', e.target.checked)} />Prefer remote roles</label>
            <p className="text-sm supporting-text">Your preferences are saved with your profile. Salary filtering is not available yet.</p>
          </section>
        </fieldset>
        {error && <div role="alert" className="form-alert error mt-5">{error}</div>}
        <div className="action-row save-row"><p className="save-state" role="status">{busy === 'profile' ? 'Saving changes…' : status || (dirty ? 'Unsaved changes' : 'No unsaved changes')}</p><Button type="submit" isLoading={busy === 'profile'} disabled={!!busy || !dirty}>Save changes</Button></div>
      </form>
    </div>
    <div role="tabpanel" id="settings-panel-security" aria-labelledby="settings-tab-security" hidden={tab !== 'security'}>
      <div className="card settings-form">
        <section className="form-section"><h2>Password and recovery</h2><p className="supporting-text mb-5">Enter your current password to change it or create a recovery code.</p>
          <div className="form-grid"><Input label="Current password" type="password" autoComplete="current-password" value={current} disabled={!!busy} onChange={e => setCurrent(e.target.value)} /></div>
        </section>
        <section className="form-section"><h2>Change password</h2><div className="form-grid"><Input label="New password" type="password" autoComplete="new-password" value={password} disabled={!!busy} onChange={e => setPassword(e.target.value)} helperText="At least 12 characters, up to 72 UTF-8 bytes." /></div>
          <p className="text-sm supporting-text mt-4">Changing your password signs out your other sessions.</p>
          <div className="action-row"><Button disabled={!!busy || !current || [...password].length < 12} isLoading={busy === 'password'} onClick={() => void security('password')}>Change password</Button></div>
          {securityFeedback?.action === 'password' && <div role={securityFeedback.error ? 'alert' : 'status'} className={'form-alert mt-5' + (securityFeedback.error ? ' error' : '')}>{securityFeedback.message}</div>}
        </section>
        <section className="form-section"><h2>Account recovery</h2><p className="supporting-text">Create a recovery code and keep it in your password manager. Creating another code replaces the previous one. Email recovery is not available.</p>
          <div className="action-row"><Button ref={recoveryButton} variant="secondary" disabled={!!busy} isLoading={busy === 'recovery'} onClick={() => void security('recovery')}>Create recovery code</Button></div>
          {securityFeedback?.action === 'recovery' && <div role={securityFeedback.error ? 'alert' : 'status'} className={'form-alert mt-5' + (securityFeedback.error ? ' error' : '')}>{securityFeedback.message}</div>}
        </section>
      </div>
    </div>
    <Modal isOpen={!!code} onClose={() => { setCode(''); requestAnimationFrame(() => recoveryButton.current?.focus()); }} title="Save your recovery code">
      <p className="mb-4 supporting-text">This code is shown once and can reset your password. Store it privately before closing this dialog.</p>
      <code className="block break-all bg-stone-100 rounded-lg p-4 select-all">{code}</code>
      <Button className="mt-5" onClick={() => { setCode(''); requestAnimationFrame(() => recoveryButton.current?.focus()); }}>I saved my code</Button>
    </Modal>
  </section>;
}
