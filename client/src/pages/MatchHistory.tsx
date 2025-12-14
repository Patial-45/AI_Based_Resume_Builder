import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiTrendingUp, FiFileText, FiCalendar, FiChevronRight, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';

interface Match {
  _id: string;
  overallScore: number;
  scoreBreakdown: {
    semanticMatch: number;
    keywordMatch: number;
    roleAlignment: number;
  };
  createdAt: string;
  resumeId: {
    _id: string;
    fileName: string;
  };
  jobDescriptionId: {
    _id: string;
    title: string;
    company: string;
  };
}

const MatchHistory = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await api.get('/match');
      setMatches(response.data);
    } catch (error: any) {
      toast.error('Failed to load match history');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-500' };
    if (score >= 60) return { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-500' };
    return { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-500' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Match History</h1>
          <p className="text-orange-100">View all your resume matches with job descriptions</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      </div>

      {/* Stats Summary */}
      {matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Matches</p>
                  <p className="text-3xl font-bold text-gray-800">{matches.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiFileText className="text-2xl text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {Math.round(matches.reduce((acc, m) => acc + m.overallScore, 0) / matches.length)}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiTrendingUp className="text-2xl text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Best Match</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {Math.max(...matches.map(m => m.overallScore))}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiTrendingUp className="text-2xl text-purple-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Matches List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match) => {
            const scoreColors = getScoreColor(match.overallScore);
            return (
              <Card key={match._id} className="hover-lift">
                <CardBody className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-4 ${scoreColors.bg} rounded-xl border-2 ${scoreColors.border}`}>
                          <div className="flex items-center space-x-2">
                            <FiTrendingUp className={`text-2xl ${scoreColors.text}`} />
                            <span className={`text-3xl font-bold ${scoreColors.text}`}>
                              {match.overallScore}%
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-1">
                            {match.jobDescriptionId.title}
                          </h3>
                          <p className="text-lg text-gray-600 mb-3">{match.jobDescriptionId.company}</p>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Semantic</p>
                              <ProgressBar
                                value={match.scoreBreakdown.semanticMatch}
                                showLabel={false}
                                color="blue"
                                className="h-2"
                              />
                              <p className="text-sm font-semibold text-gray-800 mt-1">
                                {match.scoreBreakdown.semanticMatch}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Keywords</p>
                              <ProgressBar
                                value={match.scoreBreakdown.keywordMatch}
                                showLabel={false}
                                color="green"
                                className="h-2"
                              />
                              <p className="text-sm font-semibold text-gray-800 mt-1">
                                {match.scoreBreakdown.keywordMatch}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Role Fit</p>
                              <ProgressBar
                                value={match.scoreBreakdown.roleAlignment}
                                showLabel={false}
                                color="purple"
                                className="h-2"
                              />
                              <p className="text-sm font-semibold text-gray-800 mt-1">
                                {match.scoreBreakdown.roleAlignment}%
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <FiFileText className="mr-1.5" />
                              {match.resumeId.fileName}
                            </span>
                            <span className="flex items-center">
                              <FiClock className="mr-1.5" />
                              {formatDate(match.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/match?matchId=${match._id}`}
                      className="ml-4 p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiChevronRight className="text-2xl" />
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <FiFileText className="text-5xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Match History</h3>
            <p className="text-gray-600 mb-6">
              Start matching your resume with job descriptions to see results here
            </p>
            <Link to="/match">
              <Button variant="primary">
                Match Resume
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default MatchHistory;
