import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FiUser, FiMail, FiSave, FiBriefcase, FiMapPin, FiDollarSign, FiRadio } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [preferences, setPreferences] = useState({
    jobTitle: '',
    location: '',
    remote: false,
    minSalary: '',
    maxSalary: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setName(response.data.name || '');
      setPreferences({
        jobTitle: response.data.preferences?.jobTitle || '',
        location: response.data.preferences?.location || '',
        remote: response.data.preferences?.remote || false,
        minSalary: response.data.preferences?.minSalary?.toString() || '',
        maxSalary: response.data.preferences?.maxSalary?.toString() || '',
      });
    } catch (error: any) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', {
        name,
        preferences: {
          ...preferences,
          minSalary: preferences.minSalary ? parseInt(preferences.minSalary) : undefined,
          maxSalary: preferences.maxSalary ? parseInt(preferences.maxSalary) : undefined,
        },
      });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
          <p className="text-indigo-100">Manage your account and job preferences</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      </div>

      {/* Account Information */}
      <Card>
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FiUser className="mr-2 text-blue-600" />
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              leftIcon={<FiUser />}
            />

            <Input
              label="Email Address"
              type="email"
              value={user?.email || ''}
              disabled
              leftIcon={<FiMail />}
              helperText="Email cannot be changed"
            />
          </div>
        </CardBody>
      </Card>

      {/* Job Preferences */}
      <Card>
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FiBriefcase className="mr-2 text-green-600" />
            Job Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Preferred Job Title"
              type="text"
              value={preferences.jobTitle}
              onChange={(e) => setPreferences({ ...preferences, jobTitle: e.target.value })}
              placeholder="e.g., Software Engineer"
              leftIcon={<FiBriefcase />}
            />

            <Input
              label="Preferred Location"
              type="text"
              value={preferences.location}
              onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
              leftIcon={<FiMapPin />}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Salary
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={preferences.minSalary}
                  onChange={(e) => setPreferences({ ...preferences, minSalary: e.target.value })}
                  placeholder="e.g., 80000"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maximum Salary
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={preferences.maxSalary}
                  onChange={(e) => setPreferences({ ...preferences, maxSalary: e.target.value })}
                  placeholder="e.g., 150000"
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={preferences.remote}
                  onChange={(e) => setPreferences({ ...preferences, remote: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <FiRadio className="text-gray-600" />
                <span className="font-medium text-gray-700">Prefer Remote Jobs</span>
              </label>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          isLoading={saving}
          size="lg"
          rightIcon={<FiSave />}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Profile;
