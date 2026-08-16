import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiBriefcase, FiMapPin, FiExternalLink, FiStar, FiCheck, FiSearch } from 'react-icons/fi';

import toast from 'react-hot-toast';
import { Card, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

interface Resume {
  _id: string;
  fileName: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  source: string;
  sourceUrl: string;
  description: string;
  postedDate: string;
}

interface JobMatch {
  _id: string;
  jobId: Job;
  matchScore: number;
  isSaved: boolean;
  isApplied: boolean;
}

interface ScanResponse {
  message: string;
  jobs: JobMatch[];
  note?: string;
}

const JobSearch = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [scanning, setScanning] = useState(false);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [scanNote, setScanNote] = useState<string>('');

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

  const handleScanJobs = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume');
      return;
    }

    setScanning(true);
    setScanNote('');
    try {
      const response = await api.post<ScanResponse>('/jobs/scan', { resumeId: selectedResume });
      if (response.data.note) {
        setScanNote(response.data.note);
        toast.success(`Found ${response.data.jobs.length} jobs! ${response.data.note}`);
      } else {
        toast.success(`Found ${response.data.jobs.length} jobs!`);
      }
      fetchRecommendedJobs();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Job scanning failed';
      toast.error(errorMsg);
      // If it's just "no jobs found", try to fetch existing jobs
      if (error.response?.status === 404) {
        fetchRecommendedJobs();
      }
    } finally {
      setScanning(false);
    }
  };

  const fetchRecommendedJobs = async () => {
    if (!selectedResume) return;

    setLoading(true);
    try {
      const response = await api.get(`/jobs/recommended?resumeId=${selectedResume}&limit=20`);
      setJobs(response.data);
    } catch (error: any) {
      toast.error('Failed to load recommended jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedResume) {
      fetchRecommendedJobs();
    }
  }, [selectedResume]);

  const handleSaveJob = async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/save`);
      toast.success('Job saved!');
      fetchRecommendedJobs();
    } catch (error: any) {
      toast.error('Failed to save job');
    }
  };

  const handleMarkApplied = async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/apply`);
      toast.success('Marked as applied!');
      fetchRecommendedJobs();
    } catch (error: any) {
      toast.error('Failed to mark as applied');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreBadgeVariant = (score: number): 'success' | 'warning' | 'danger' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">AI-Powered Job Search</h1>
          <p className="text-purple-100">Scan job portals and find matches based on your resume</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Naukri', 'LinkedIn', 'Glassdoor', 'iimjobs', 'Indeed', 'Unstop', 'Foundit'].map((platform) => (
              <span key={platform} className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                {platform}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      </div>

      {/* Search Controls */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
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
            <Button
              onClick={handleScanJobs}
              isLoading={scanning}
              disabled={!selectedResume}
              size="lg"
            >
              <FiSearch className="mr-2" />
              {scanning ? 'Scanning Portals...' : 'Scan Job Portals'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Scan Note */}
      {scanNote && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardBody className="p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {scanNote}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((jobMatch) => (
            <Card key={jobMatch._id} className="hover-lift">
              <CardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 bg-gradient-to-br ${getScoreColor(jobMatch.matchScore)} rounded-xl text-white shadow-lg`}>
                        <FiBriefcase className="text-2xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-800">{jobMatch.jobId.title}</h3>
                          <Badge variant={getScoreBadgeVariant(jobMatch.matchScore)}>
                            {jobMatch.matchScore}% Match
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                          <span className="flex items-center">
                            <FiBriefcase className="mr-1.5" />
                            {jobMatch.jobId.company}
                          </span>
                          <span className="flex items-center">
                            <FiMapPin className="mr-1.5" />
                            {jobMatch.jobId.remote ? 'Remote' : jobMatch.jobId.location || 'Not specified'}
                          </span>
                          <Badge 
                            variant={jobMatch.jobId.source === 'sample' ? 'warning' : 'primary'} 
                            className="capitalize"
                          >
                            {jobMatch.jobId.source === 'sample' ? 'Sample Job' : jobMatch.jobId.source}
                          </Badge>
                        </div>
                        <p className="text-gray-700 line-clamp-2 mb-4">
                          {jobMatch.jobId.description.substring(0, 200)}...
                        </p>
                        <div className="flex items-center gap-4">
                          <a
                            href={jobMatch.jobId.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <span>View Job</span>
                            <FiExternalLink className="ml-1.5" />
                          </a>
                          {jobMatch.isApplied && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <FiCheck />
                              Applied
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleSaveJob(jobMatch.jobId._id)}
                      className={`p-3 rounded-lg transition-colors ${
                        jobMatch.isSaved
                          ? 'text-yellow-600 bg-yellow-50'
                          : 'text-yellow-500 hover:bg-yellow-50'
                      }`}
                      title={jobMatch.isSaved ? 'Saved' : 'Save job'}
                    >
                      <FiStar className={`text-xl ${jobMatch.isSaved ? 'fill-current' : ''}`} />
                    </button>
                    {!jobMatch.isApplied && (
                      <button
                        onClick={() => handleMarkApplied(jobMatch.jobId._id)}
                        className="p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as applied"
                      >
                        <FiCheck className="text-xl" />
                      </button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody className="p-12 text-center">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <FiBriefcase className="text-5xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Jobs Found</h3>
            <p className="text-gray-600 mb-6">
              {selectedResume
                ? 'Click "Scan Job Portals" to find relevant jobs from Naukri, LinkedIn, Glassdoor, iimjobs, Indeed, Unstop, and Foundit. If scraping fails, sample jobs will be generated based on your resume.'
                : 'Please select a resume to start searching for jobs'}
            </p>
            {selectedResume && (
              <Button onClick={handleScanJobs} variant="primary">
                <FiSearch className="mr-2" />
                Scan Job Portals
              </Button>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default JobSearch;
