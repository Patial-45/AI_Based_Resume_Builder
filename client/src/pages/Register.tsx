import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiArrowRight, FiBriefcase } from 'react-icons/fi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Register form submitted:', { name, email, hasPassword: !!password });
      await register(name, email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Register form error:', error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Setting error message:', errorMessage);
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
          <h1 className="text-4xl font-bold gradient-text mb-2">Get Started</h1>
          <p className="text-gray-600">Create your account to begin</p>
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
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                leftIcon={<FiUser />}
                required
              />

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
                placeholder="Minimum 6 characters"
                leftIcon={<FiLock />}
                helperText="Must be at least 6 characters"
                required
                minLength={6}
              />

              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                rightIcon={<FiArrowRight />}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Benefits */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center space-x-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✓</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">AI-Powered Matching</p>
              <p className="text-sm text-gray-600">Get instant resume-job match scores</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✓</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Job Discovery</p>
              <p className="text-sm text-gray-600">Find relevant jobs across all portals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
