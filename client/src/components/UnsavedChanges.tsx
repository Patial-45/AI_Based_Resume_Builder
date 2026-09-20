import { useCallback, useEffect } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';
import Modal from './ui/Modal';
import Button from './ui/Button';
export default function UnsavedChanges({ dirty }: { dirty: boolean }) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search));
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } }, [dirty]));
  useEffect(() => {
    const guard = (event: Event) => { if (dirty && !window.confirm('You have unsaved changes. Discard them and sign out?')) event.preventDefault(); };
    window.addEventListener('workspace:before-signout', guard);
    return () => window.removeEventListener('workspace:before-signout', guard);
  }, [dirty]);
  return <Modal isOpen={blocker.state === 'blocked'} onClose={() => blocker.state === 'blocked' && blocker.reset()} title="Leave without saving?">
    <p className="supporting-text">Your unsaved changes will be lost. Stay here to save them before leaving.</p>
    <div className="action-row"><Button variant="secondary" onClick={() => blocker.state === 'blocked' && blocker.reset()}>Keep editing</Button><Button variant="danger" onClick={() => blocker.state === 'blocked' && blocker.proceed()}>Discard changes</Button></div>
  </Modal>;
}
