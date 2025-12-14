import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiFileText, FiZap, FiDownload, FiSave, FiCheck, FiX, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

interface Resume {
  _id: string;
  fileName: string;
}

interface JobDescription {
  _id: string;
  title: string;
  company: string;
}

interface ATSResume {
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    achievements: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    details?: string;
  }>;
  certifications: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  keywords: string[];
  atsScore: number;
  recommendations: string[];
}

const ResumeBuilder = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJD, setSelectedJD] = useState('');
  const [jdText, setJdText] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [generatedResume, setGeneratedResume] = useState<ATSResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resumesRes, jdsRes, profileRes] = await Promise.all([
        api.get('/resumes'),
        api.get('/match').then(res => {
          // Extract unique job descriptions from matches
          const jds = new Map();
          res.data.forEach((match: any) => {
            if (match.jobDescriptionId && !jds.has(match.jobDescriptionId._id)) {
              jds.set(match.jobDescriptionId._id, match.jobDescriptionId);
            }
          });
          return Array.from(jds.values());
        }).catch(() => []),
        api.get('/auth/profile')
      ]);
      
      setResumes(resumesRes.data);
      setJobDescriptions(jdsRes);
      if (profileRes.data) {
        setUserInfo({
          name: profileRes.data.name || '',
          email: profileRes.data.email || '',
          phone: '',
          location: profileRes.data.preferences?.location || ''
        });
      }
    } catch (error: any) {
      toast.error('Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleGenerate = async () => {
    if (!jdText.trim() && !selectedJD) {
      toast.error('Please provide a job description');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/resume-builder/generate', {
        jobDescriptionId: selectedJD || undefined,
        jdText: jdText.trim() || undefined,
        userInfo,
        existingResumeId: selectedResume || undefined
      });
      
      setGeneratedResume(response.data);
      toast.success('ATS-friendly resume generated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResume = async () => {
    if (!generatedResume) return;

    // Convert generated resume to text format for saving
    let resumeText = `PROFESSIONAL SUMMARY\n${generatedResume.summary}\n\n`;
    
    resumeText += `PROFESSIONAL EXPERIENCE\n`;
    generatedResume.experience.forEach(exp => {
      resumeText += `${exp.title} | ${exp.company} | ${exp.duration}\n`;
      exp.achievements.forEach(ach => {
        resumeText += `• ${ach}\n`;
      });
      resumeText += '\n';
    });

    resumeText += `SKILLS\n`;
    resumeText += `Technical: ${generatedResume.skills.technical.join(', ')}\n`;
    resumeText += `Soft Skills: ${generatedResume.skills.soft.join(', ')}\n`;
    resumeText += `Tools: ${generatedResume.skills.tools.join(', ')}\n\n`;

    resumeText += `EDUCATION\n`;
    generatedResume.education.forEach(edu => {
      resumeText += `${edu.degree} | ${edu.institution} | ${edu.year}\n`;
      if (edu.details) resumeText += `${edu.details}\n`;
    });

    if (generatedResume.certifications.length > 0) {
      resumeText += `\nCERTIFICATIONS\n`;
      generatedResume.certifications.forEach(cert => {
        resumeText += `• ${cert}\n`;
      });
    }

    if (generatedResume.projects.length > 0) {
      resumeText += `\nPROJECTS\n`;
      generatedResume.projects.forEach(proj => {
        resumeText += `${proj.name}\n`;
        resumeText += `${proj.description}\n`;
        resumeText += `Technologies: ${proj.technologies.join(', ')}\n\n`;
      });
    }

    // Here you would typically save this as a file or to database
    // For now, we'll create a downloadable text file
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATS-Resume-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Resume downloaded!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">AI Resume Builder</h1>
          <p className="text-indigo-100">Generate ATS-friendly resumes optimized for specific job descriptions</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiZap className="mr-2 text-purple-600" />
                Build Your Resume
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Use Existing Resume (Optional)
                  </label>
                  {loadingData ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <select
                      value={selectedResume}
                      onChange={(e) => setSelectedResume(e.target.value)}
                      className="input"
                    >
                      <option value="">None - Create from scratch</option>
                      {resumes.map((resume) => (
                        <option key={resume._id} value={resume._id}>
                          {resume.fileName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Job Description (Optional)
                  </label>
                  {loadingData ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <select
                      value={selectedJD}
                      onChange={(e) => {
                        setSelectedJD(e.target.value);
                        if (e.target.value) setJdText('');
                      }}
                      className="input"
                    >
                      <option value="">Or paste job description below</option>
                      {jobDescriptions.map((jd) => (
                        <option key={jd._id} value={jd._id}>
                          {jd.title} - {jd.company}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={8}
                    className="input resize-none"
                    disabled={!!selectedJD}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    placeholder="John Doe"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                  <Input
                    label="Phone"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                  <Input
                    label="Location"
                    value={userInfo.location}
                    onChange={(e) => setUserInfo({ ...userInfo, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  isLoading={loading}
                  disabled={(!jdText.trim() && !selectedJD)}
                  className="w-full"
                  size="lg"
                >
                  <FiZap className="mr-2" />
                  Generate ATS Resume
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Generated Resume Preview */}
        <div className="space-y-6">
          {generatedResume ? (
            <>
              <Card>
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Generated Resume</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="success">ATS Score: {generatedResume.atsScore}%</Badge>
                        <Badge variant="primary">{generatedResume.keywords.length} Keywords</Badge>
                      </div>
                    </div>
                    <Button
                      onClick={handleSaveResume}
                      variant="success"
                      size="sm"
                    >
                      <FiDownload className="mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Professional Summary</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{generatedResume.summary}</p>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Experience</h3>
                    <div className="space-y-4">
                      {generatedResume.experience.map((exp, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-gray-800">{exp.title}</p>
                              <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
                            </div>
                          </div>
                          <ul className="list-disc list-inside space-y-1 mt-2">
                            {exp.achievements.map((ach, i) => (
                              <li key={i} className="text-sm text-gray-700">{ach}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Skills</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Technical:</p>
                        <div className="flex flex-wrap gap-2">
                          {generatedResume.skills.technical.map((skill, idx) => (
                            <Badge key={idx} variant="primary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Soft Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {generatedResume.skills.soft.map((skill, idx) => (
                            <Badge key={idx} variant="primary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {generatedResume.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Recommendations</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {generatedResume.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardBody>
              </Card>
            </>
          ) : (
            <Card>
              <CardBody className="p-12 text-center">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <FiFileText className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Build</h3>
                <p className="text-gray-600">
                  Enter job description and click "Generate ATS Resume" to create an optimized resume
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

