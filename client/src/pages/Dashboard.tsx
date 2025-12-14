import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { FiUpload, FiSearch, FiFileText, FiBriefcase, FiTrendingUp, FiArrowRight, FiPlus, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';

interface Resume {
  _id: string;
  fileName: string;
  createdAt: string;
  sections: {
    skills: string[];
    experience: any[];
  };
}

interface Match {
  _id: string;
  overallScore: number;
  createdAt: string;
  resumeId: {
    fileName: string;
  };
  jobDescriptionId: {
    title: string;
    company: string;
  };
}

const Dashboard = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resumesRes, matchesRes] = await Promise.all([
        api.get('/resumes'),
        api.get('/match')
      ]);
      setResumes(resumesRes.data);
      setRecentMatches(matchesRes.data.slice(0, 5));
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const activeResume = resumes[0];
  const totalSkills = activeResume?.sections?.skills?.length || 0;
  const avgMatchScore = recentMatches.length > 0
    ? Math.round(recentMatches.reduce((acc, m) => acc + m.overallScore, 0) / recentMatches.length)
    : 0;

  const quickActions = [
    {
      icon: FiUpload,
      title: 'Upload Resume',
      description: 'Upload and parse your resume',
      link: '/upload',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FiZap,
      title: 'AI Resume Builder',
      description: 'Generate ATS-friendly resume',
      link: '/builder',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: FiSearch,
      title: 'Match Resume',
      description: 'Match with job descriptions',
      link: '/match',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: FiBriefcase,
      title: 'Find Jobs',
      description: 'AI-powered job search',
      link: '/jobs',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FiFileText,
      title: 'View History',
      description: 'Check match history',
      link: '/history',
      color: 'from-orange-500 to-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome Back! 👋</h1>
          <p className="text-blue-100 text-lg">Manage your resumes and find the perfect job matches</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-3xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Resumes</p>
                <p className="text-3xl font-bold text-gray-800">{resumes.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiFileText className="text-2xl text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Skills</p>
                <p className="text-3xl font-bold text-gray-800">{totalSkills}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiTrendingUp className="text-2xl text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Match Score</p>
                <p className="text-3xl font-bold text-gray-800">{avgMatchScore}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiBriefcase className="text-2xl text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.link} to={action.link}>
                <Card className="hover-lift h-full group">
                  <CardBody className="p-6 text-center">
                    <div className={`inline-flex p-4 bg-gradient-to-br ${action.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="text-white text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Resume & Recent Matches */}
      {activeResume ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Resume */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Active Resume</h2>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">File Name</p>
                  <p className="text-lg font-semibold text-gray-800">{activeResume.fileName}</p>
                </div>
                {activeResume.sections?.skills && activeResume.sections.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {activeResume.sections.skills.slice(0, 8).map((skill, idx) => (
                        <Badge key={idx} variant="primary">{skill}</Badge>
                      ))}
                      {activeResume.sections.skills.length > 8 && (
                        <Badge variant="primary">+{activeResume.sections.skills.length - 8} more</Badge>
                      )}
                    </div>
                  </div>
                )}
                <Link to="/upload">
                  <Button variant="ghost" size="sm" className="w-full">
                    <FiPlus className="mr-2" />
                    Upload New Resume
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Recent Matches */}
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Matches</h2>
                <Link to="/history" className="text-sm text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
              {recentMatches.length > 0 ? (
                <div className="space-y-4">
                  {recentMatches.map((match) => (
                    <div
                      key={match._id}
                      className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{match.jobDescriptionId.title}</p>
                          <p className="text-sm text-gray-600">{match.jobDescriptionId.company}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-3 py-1 rounded-full font-bold ${
                            match.overallScore >= 80
                              ? 'bg-green-100 text-green-700'
                              : match.overallScore >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {match.overallScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiFileText className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No matches yet</p>
                  <Link to="/match">
                    <Button variant="primary" size="sm">
                      Start Matching
                    </Button>
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
            <FiUpload className="text-3xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Started</h2>
          <p className="text-gray-600 mb-6">Upload your first resume to begin matching with job descriptions</p>
          <Link to="/upload">
            <Button variant="primary" rightIcon={<FiArrowRight />}>
              Upload Resume
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
