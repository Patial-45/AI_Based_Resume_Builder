import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { FiBriefcase, FiMenu, FiLogOut, FiGrid, FiFileText, FiTarget, FiEdit3, FiClock, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { errorMessage } from '../services/api';
import Modal from './ui/Modal';
const links = [
  { to: '/dashboard', label: 'Overview', Icon: FiGrid },
  { to: '/upload', label: 'Resumes', Icon: FiFileText },
  { to: '/match', label: 'Match a role', Icon: FiTarget },
  { to: '/builder', label: 'Resume builder', Icon: FiEdit3 },
  { to: '/jobs', label: 'Find jobs', Icon: FiBriefcase },
  { to: '/history', label: 'Match history', Icon: FiClock },
];
export default function Navbar() {
  const { user, logout } = useAuth(), navigate = useNavigate(), location = useLocation();
  const [open, setOpen] = useState(false), [leaving, setLeaving] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const close = () => { if (query.matches) setOpen(false); };
    query.addEventListener('change', close);
    return () => query.removeEventListener('change', close);
  }, []);
  async function signOut() {
    // Let the active editor protect unsaved work before invalidating its session.
    const event = new Event('workspace:before-signout', { cancelable: true });
    if (!window.dispatchEvent(event)) return;
    setLeaving(true);
    try { await logout(); setOpen(false); navigate('/login'); }
    catch (error) { toast.error(errorMessage(error, 'Could not sign out. Please retry.')); }
    finally { setLeaving(false); }
  }
  const navigation = <>
    <div className="nav-main">{links.map(({ to, label, Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}><Icon aria-hidden="true" />{label}</NavLink>)}</div>
    <div className="nav-account"><NavLink to="/profile" onClick={() => setOpen(false)} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}><FiSettings aria-hidden="true" />Settings</NavLink>
      <button type="button" className="nav-link logout" disabled={leaving} onClick={() => void signOut()}><FiLogOut aria-hidden="true" />{leaving ? 'Signing out…' : 'Sign out'}</button></div>
  </>;
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className={'site-header' + (user ? ' signed-in-header' : '')}>
      <div className="header-inner"><Link to={user ? '/dashboard' : '/login'} className="brand"><span className="brand-mark"><FiBriefcase aria-hidden="true" /></span>Resume Builder</Link>
        {user && <button ref={toggle} type="button" className="nav-toggle" aria-haspopup="dialog" aria-expanded={open} aria-label="Open navigation" onClick={() => setOpen(true)}><FiMenu aria-hidden="true" /></button>}
      </div>
      {user && <nav className="workspace-nav desktop-navigation" aria-label="Workspace">{navigation}</nav>}
    </header>
    {user && <Modal isOpen={open} onClose={() => setOpen(false)} title="Workspace navigation" size="sm"><nav className="workspace-nav mobile-navigation" aria-label="Mobile workspace">{navigation}</nav></Modal>}
  </>;
}
