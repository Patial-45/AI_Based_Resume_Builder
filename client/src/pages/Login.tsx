import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowRight, FiBriefcase } from 'react-icons/fi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <FiBriefcase className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue to Resume Builder</p>
        </div>

        <Card className="shadow-2xl">
          <CardBody className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={<FiMail />}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                leftIcon={<FiLock />}
                required
              />

              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                rightIcon={<FiArrowRight />}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-xs text-gray-600">AI Matching</p>
          </div>
          <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-xs text-gray-600">Smart Analytics</p>
          </div>
          <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-xs text-gray-600">Job Discovery</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
