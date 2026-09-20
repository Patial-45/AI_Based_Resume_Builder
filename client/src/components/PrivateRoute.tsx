import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, sessionError, refresh } = useAuth();
  if (loading) return <div role="status" className="p-12 text-center">Checking your session…</div>;
  if (sessionError) return <div role="alert" className="p-12 text-center"><p>{sessionError}</p><button className="btn-primary mt-4" onClick={() => void refresh()}>Retry connection</button></div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};
export default PrivateRoute;
