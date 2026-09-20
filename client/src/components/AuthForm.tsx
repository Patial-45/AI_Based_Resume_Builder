import { useState, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { errorMessage } from '../services/api';
import Input from './ui/Input';
import Button from './ui/Button';
export default function AuthForm({ register = false }: { register?: boolean }) {
  const auth = useAuth(), navigate = useNavigate(), alert = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  if (auth.user && !auth.sessionError) return <Navigate to="/dashboard" replace />;
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      if (register) await auth.register(name, email, password); else await auth.login(email, password);
      navigate('/dashboard');
    } catch (cause) { setError(errorMessage(cause, 'Could not connect. Check your connection and try again.')); requestAnimationFrame(() => alert.current?.focus()); }
    finally { setBusy(false); }
  }
  return <section className="auth-layout">
    <div className="auth-intro"><p className="auth-headline">A clearer path to<br />your next role.</p><p>Keep your experience organized. Understand each opportunity. Build a resume that tells your story.</p>
      <ol className="auth-benefits"><li>Bring your experience together</li><li>Find where your skills fit</li><li>Make every application count</li></ol>
    </div>
    <div className="auth-card"><h1>{register ? 'Create your workspace' : 'Welcome back'}</h1><p className="text-gray-600 mb-7">{register ? 'Start with your name and account details.' : 'Sign in to pick up where you left off.'}</p>
      {error && <div ref={alert} tabIndex={-1} role="alert" className="form-alert error mb-5">{error}</div>}
      <form onSubmit={submit} className="space-y-5">
        {register && <Input label="Full name" autoComplete="name" maxLength={100} value={name} onChange={e => setName(e.target.value)} required />}
        <Input label="Email address" type="email" autoComplete="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} required />
        <Input label="Password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 12 : undefined} value={password} onChange={e => setPassword(e.target.value)} required helperText={register ? 'Use at least 12 characters (up to 72 UTF-8 bytes).' : undefined} />
        <Button type="submit" isLoading={busy} className="w-full">{register ? 'Create account' : 'Sign in'}</Button>
      </form>
      <p className="mt-6 text-sm text-gray-600">{register ? 'Already have an account? ' : 'New here? '}<Link className="text-accent font-semibold underline underline-offset-4" to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>
      {!register && <Link className="inline-block mt-4 text-sm text-accent underline underline-offset-4" to="/recover">Recover account with a recovery code</Link>}
    </div>
  </section>;
}

