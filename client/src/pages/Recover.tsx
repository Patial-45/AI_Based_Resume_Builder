import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
export default function Recover() {
  const [email, setEmail] = useState(''), [code, setCode] = useState(''), [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [done, setDone] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { const response = await api.post('/auth/recover', { email, recoveryCode: code.trim(), newPassword: password }, { timeout: 20000 }); setMessage(response.data.message); setDone(true); setPassword(''); setCode(''); }
    catch (error) { setMessage(errorMessage(error, 'Could not reset your password. Please retry.')); }
    finally { setBusy(false); }
  }
  return <section className="auth-card mx-auto my-10 max-w-lg"><h1 className="text-3xl font-semibold mb-3">Get back to your workspace</h1><p className="text-gray-600 mb-6">Use the recovery code you saved from Settings. Codes can be used once. Without a saved code, self-service recovery is unavailable.</p>
    {message && <p role="status" className="form-alert mb-5">{message}</p>}
    {!done && <form onSubmit={submit} className="space-y-5"><Input label="Email address" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <Input label="Recovery code" value={code} onChange={e => setCode(e.target.value)} autoComplete="off" minLength={48} maxLength={48} required />
      <Input label="New password" type="password" autoComplete="new-password" minLength={12} value={password} onChange={e => setPassword(e.target.value)} required helperText="At least 12 characters, up to 72 UTF-8 bytes." />
      <Button type="submit" isLoading={busy}>Reset password</Button></form>}
    <Link className="inline-block mt-6 text-accent underline" to="/login">Back to sign in</Link></section>;
}

