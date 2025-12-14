import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { FiUpload, FiFile, FiTrash2, FiCheck, FiX, FiCloud } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

interface Resume {
  _id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  sections: {
    summary: string;
    experience: any[];
    education: any[];
    skills: string[];
    certifications: string[];
  };
}

const ResumeUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes');
      setResumes(response.data);
    } catch (error: any) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (selectedFile: File): boolean => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF or DOCX file');
      return false;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      await api.post('/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Resume uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchResumes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await api.delete(`/resumes/${id}`);
      toast.success('Resume deleted successfully');
      fetchResumes();
    } catch (error: any) {
      toast.error('Failed to delete resume');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Upload Resume</h1>
          <p className="text-blue-100">Upload your resume in PDF or DOCX format for AI-powered matching</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      </div>

      {/* Upload Zone */}
      <Card>
        <CardBody className="p-8">
          <div
            ref={dropzoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : file
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            
            {!file ? (
              <>
                <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
                  <FiCloud className="text-4xl text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {isDragging ? 'Drop your file here' : 'Drag & drop your resume'}
                </h3>
                <p className="text-gray-600 mb-6">or</p>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="btn btn-primary inline-flex items-center justify-center">
                    <FiUpload className="mr-2" />
                    Browse Files
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-4">Supports PDF and DOCX files up to 5MB</p>
              </>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex p-4 bg-green-100 rounded-full">
                  <FiCheck className="text-4xl text-green-600" />
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <FiFile className="text-3xl text-green-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Button
                    onClick={handleUpload}
                    isLoading={uploading}
                    variant="success"
                  >
                    <FiUpload className="mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                  <Button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    variant="ghost"
                  >
                    <FiX className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Resume List */}
      <Card>
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Resumes</h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : resumes.length > 0 ? (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  className="group p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FiFile className="text-2xl text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="font-semibold text-gray-800">{resume.fileName}</p>
                          <Badge variant="success">Active</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{formatFileSize(resume.fileSize)}</span>
                          <span>•</span>
                          <span>{formatDate(resume.createdAt)}</span>
                        </div>
                        {resume.sections?.skills && resume.sections.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {resume.sections.skills.slice(0, 6).map((skill, idx) => (
                              <Badge key={idx} variant="primary">{skill}</Badge>
                            ))}
                            {resume.sections.skills.length > 6 && (
                              <Badge variant="secondary">+{resume.sections.skills.length - 6}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(resume._id)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <FiTrash2 className="text-xl" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiFile className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No resumes uploaded yet</p>
              <p className="text-gray-500 text-sm">Upload your first resume to get started</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ResumeUpload;
