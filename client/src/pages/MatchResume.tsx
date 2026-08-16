import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiSearch, FiTrendingUp, FiCheckCircle, FiXCircle, FiAlertCircle, FiFileText, FiTarget } from 'react-icons/fi';

import toast from 'react-hot-toast';
import { Card, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Skeleton from '../components/ui/Skeleton';

interface Resume {
  _id: string;
  fileName: string;
}

interface MatchResult {
  _id: string;
  overallScore: number;
  scoreBreakdown: {
    semanticMatch: number;
    keywordMatch: number;
    roleAlignment: number;
  };
  missingKeywords: Array<{
    keyword: string;
    category: string;
    importance: string;
    suggestion: string;
  }>;
  recommendations: Array<{
    section: string;
    suggestion: string;
    priority: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  detailedAnalysis?: {
    currentScore: number;
    targetScore: number;
    estimatedScoreAfterImprovements: number;
    sectionAnalysis: {
      summary?: {
        score: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: Array<{
          action: string;
          location: string;
          impact: string;
          expectedScoreIncrease: number;
          example: string;
        }>;
        beforeAfter?: {
          before: string;
          after: string;
        };
      };
      experience?: {
        score: number;
        strengths: string[];
        weaknesses: string[];
        suggestions: Array<{
          action: string;
          location: string;
          impact: string;
          expectedScoreIncrease: number;
          example: string;
        }>;
        beforeAfter?: Array<{
          before: string;
          after: string;
        }>;
      };
      skills?: {
        score: number;
        missingKeywords: string[];
        suggestions: Array<{
          action: string;
          skill: string;
          impact: string;
          expectedScoreIncrease: number;
          whereToAdd: string;
        }>;
      };
    };
    keywordAnalysis: {
      matchedKeywords: string[];
      missingKeywords: Array<{
        keyword: string;
        importance: string;
        frequency: number;
        suggestedLocations: string[];
      }>;
      keywordDensity?: {
        optimal: number;
        current: number;
      };
    };
    priorityActions: Array<{
      priority: number;
      action: string;
      impact: string;
      expectedScoreIncrease: number;
      timeToImplement: string;
      location?: string;
    }>;
  };
}

const MatchResume = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jdText, setJdText] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes');
      setResumes(response.data);
      if (response.data.length > 0) {
        setSelectedResume(response.data[0]._id);
      }
    } catch (error: any) {
      toast.error('Failed to load resumes');
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleMatch = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume');
      return;
    }
    if (!jdText.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/match', {
        resumeId: selectedResume,
        jdText: jdText.trim(),
        title: title.trim() || 'Untitled Job',
        company: company.trim() || 'Unknown Company',
      });
      setMatchResult(response.data);
      toast.success('Match analysis completed!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Matching failed');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-100', border: 'border-green-500' };
    if (score >= 60) return { text: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-500' };
    return { text: 'text-red-600', bg: 'bg-red-100', border: 'border-red-500' };
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Match Resume with Job Description</h1>
          <p className="text-green-100">Get AI-powered match score and improvement suggestions</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiFileText className="mr-2 text-blue-600" />
                Resume & Job Details
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Resume
                  </label>
                  {loadingResumes ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <select
                      value={selectedResume}
                      onChange={(e) => setSelectedResume(e.target.value)}
                      className="input"
                    >
                      <option value="">Select a resume...</option>
                      {resumes.map((resume) => (
                        <option key={resume._id} value={resume._id}>
                          {resume.fileName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <Input
                  label="Job Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Software Engineer"
                />

                <Input
                  label="Company Name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Google"
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={12}
                    className="input resize-none"
                  />
                </div>

                <Button
                  onClick={handleMatch}
                  isLoading={loading}
                  disabled={!selectedResume || !jdText.trim()}
                  className="w-full"
                  size="lg"
                >
                  <FiSearch className="mr-2" />
                  Get Match Score
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {matchResult ? (
            <>
              {/* Overall Score Card */}
              <Card className="border-4" style={{ borderColor: getScoreColor(matchResult.overallScore).border }}>
                <CardBody className="p-8 text-center">
                  <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
                    <FiTrendingUp className={`text-5xl ${getScoreColor(matchResult.overallScore).text}`} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Overall Match Score</p>
                  <p className={`text-6xl font-bold mb-2 ${getScoreColor(matchResult.overallScore).text}`}>
                    {matchResult.overallScore}%
                  </p>
                  <p className="text-gray-600">
                    {matchResult.overallScore >= 80
                      ? 'Excellent match! You\'re a strong candidate.'
                      : matchResult.overallScore >= 60
                      ? 'Good match. Consider some improvements.'
                      : 'Needs improvement. Review suggestions below.'}
                  </p>
                </CardBody>
              </Card>

              {/* Score Breakdown */}
              <Card>
                <CardBody className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FiTarget className="mr-2 text-purple-600" />
                    Score Breakdown
                  </h3>
                  <div className="space-y-4">
                    <ProgressBar
                      value={matchResult.scoreBreakdown.semanticMatch}
                      label="Semantic Match"
                      color="blue"
                    />
                    <ProgressBar
                      value={matchResult.scoreBreakdown.keywordMatch}
                      label="Keyword Match"
                      color="green"
                    />
                    <ProgressBar
                      value={matchResult.scoreBreakdown.roleAlignment}
                      label="Role Alignment"
                      color="purple"
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Strengths */}
              {matchResult.strengths && matchResult.strengths.length > 0 && (
                <Card className="border-l-4 border-l-green-500">
                  <CardBody className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FiCheckCircle className="mr-2 text-green-600" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {matchResult.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              )}

              {/* Weaknesses */}
              {matchResult.weaknesses && matchResult.weaknesses.length > 0 && (
                <Card className="border-l-4 border-l-red-500">
                  <CardBody className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FiXCircle className="mr-2 text-red-600" />
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {matchResult.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-red-600 mr-2">✗</span>
                          <span className="text-gray-700">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              )}

              {/* Missing Keywords */}
              {matchResult.missingKeywords && matchResult.missingKeywords.length > 0 && (
                <Card>
                  <CardBody className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FiAlertCircle className="mr-2 text-yellow-600" />
                      Missing Keywords
                    </h3>
                    <div className="space-y-3">
                      {matchResult.missingKeywords.map((item, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-800">{item.keyword}</span>
                            <Badge variant={getImportanceColor(item.importance)}>
                              {item.importance}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{item.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Recommendations */}
              {matchResult.recommendations && matchResult.recommendations.length > 0 && (
                <Card>
                  <CardBody className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {matchResult.recommendations.map((rec, idx) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                          <p className="font-semibold text-gray-800">{rec.section}</p>
                          <p className="text-sm text-gray-600 mt-1">{rec.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardBody className="p-12 text-center">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <FiSearch className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Analyze</h3>
                <p className="text-gray-600">
                  Enter job description and click "Get Match Score" to see detailed analysis
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchResume;
