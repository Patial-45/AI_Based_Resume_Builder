import Resume from '../models/Resume.js';
import Job from '../models/Job.js';
import JobMatch from '../models/JobMatch.js';
import User from '../models/User.js';
import { scanJobPortals } from '../services/jobScraper.js';
import { cosineSimilarity } from '../services/aiService.js';

export const scanJobs = async (req, res) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: 'Resume ID is required' });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const user = await User.findById(req.user._id);
    const userPreferences = user.preferences || {};

    // Scan job portals
    let jobs = [];
    try {
      jobs = await scanJobPortals(
        resume.extractedText,
        resume.sections || {},
        userPreferences
      );
    } catch (error) {
      console.error('Error scanning job portals:', error);
      return res.status(500).json({ 
        message: 'Failed to scan job portals. This might be due to website blocking or API issues.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (jobs.length === 0) {
      // Try to get any existing jobs from database as fallback
      const existingJobs = await Job.find({ isActive: true })
        .sort({ postedDate: -1 })
        .limit(20);
      
      if (existingJobs.length > 0) {
        console.log(`Returning ${existingJobs.length} existing jobs from database`);
        // Calculate match scores for existing jobs
        const jobMatches = [];
        for (const job of existingJobs) {
          try {
            let matchScore = 50;
            if (resume.embedding && job.embedding && 
                Array.isArray(resume.embedding) && Array.isArray(job.embedding)) {
              try {
                const similarity = cosineSimilarity(resume.embedding, job.embedding);
                matchScore = Math.round(similarity * 100);
              } catch (error) {
                console.warn('Error calculating similarity:', error.message);
              }
            }
            
            let jobMatch = await JobMatch.findOne({
              userId: req.user._id,
              jobId: job._id
            });
            
            if (!jobMatch) {
              jobMatch = await JobMatch.create({
                userId: req.user._id,
                resumeId: resume._id,
                jobId: job._id,
                matchScore
              });
            }
            
            jobMatches.push({ job, match: jobMatch });
          } catch (error) {
            console.error('Error processing existing job:', error);
          }
        }
        
        return res.json({
          message: `Found ${jobMatches.length} jobs from database`,
          jobs: jobMatches.sort((a, b) => b.match.matchScore - a.match.matchScore),
          note: 'These are previously scraped jobs. New job scraping may have failed due to website changes.'
        });
      }
      
      return res.status(404).json({ 
        message: 'No jobs found. Job scraping may have failed due to website structure changes or rate limiting. Sample jobs have been generated based on your resume.',
        jobs: []
      });
    }

    // Calculate match scores for each job
    const jobMatches = [];
    for (const job of jobs) {
      try {
        let matchScore = 50; // Default score
        
        // Try to calculate similarity if embeddings exist
        if (resume.embedding && job.embedding && 
            Array.isArray(resume.embedding) && Array.isArray(job.embedding) &&
            resume.embedding.length > 0 && job.embedding.length > 0) {
          try {
            const similarity = cosineSimilarity(resume.embedding, job.embedding);
            matchScore = Math.round(similarity * 100);
          } catch (error) {
            console.warn('Error calculating similarity for job:', error.message);
            // Use default score
          }
        }

        // Create or update job match
        let jobMatch = await JobMatch.findOne({
          userId: req.user._id,
          jobId: job._id
        });

        if (!jobMatch) {
          jobMatch = await JobMatch.create({
            userId: req.user._id,
            resumeId: resume._id,
            jobId: job._id,
            matchScore
          });
        } else {
          jobMatch.matchScore = matchScore;
          await jobMatch.save();
        }

        jobMatches.push({
          job,
          match: jobMatch
        });
      } catch (error) {
        console.error('Error processing job match:', error);
        // Continue with other jobs
      }
    }

    res.json({
      message: `Found ${jobs.length} jobs`,
      jobs: jobMatches.sort((a, b) => b.match.matchScore - a.match.matchScore)
    });
  } catch (error) {
    console.error('Error scanning jobs:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendedJobs = async (req, res) => {
  try {
    const { resumeId, limit = 20 } = req.query;

    if (!resumeId) {
      return res.status(400).json({ message: 'Resume ID is required' });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Get job matches for this resume
    const jobMatches = await JobMatch.find({
      userId: req.user._id,
      resumeId: resume._id,
      isIgnored: false
    })
      .populate('jobId')
      .sort({ matchScore: -1 })
      .limit(parseInt(limit));

    res.json(jobMatches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get match score if user has a resume
    const resume = await Resume.findOne({
      userId: req.user._id,
      isActive: true
    }).sort({ createdAt: -1 });

    let matchScore = null;
    if (resume && resume.embedding && job.embedding) {
      const similarity = cosineSimilarity(resume.embedding, job.embedding);
      matchScore = Math.round(similarity * 100);
    }

    res.json({ job, matchScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveJob = async (req, res) => {
  try {
    const jobMatch = await JobMatch.findOneAndUpdate(
      {
        userId: req.user._id,
        jobId: req.params.id
      },
      {
        isSaved: true
      },
      {
        new: true,
        upsert: true
      }
    ).populate('jobId');

    res.json(jobMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await JobMatch.find({
      userId: req.user._id,
      isSaved: true
    })
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.json(savedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markJobAsApplied = async (req, res) => {
  try {
    const jobMatch = await JobMatch.findOneAndUpdate(
      {
        userId: req.user._id,
        jobId: req.params.id
      },
      {
        isApplied: true,
        isSaved: true
      },
      {
        new: true,
        upsert: true
      }
    ).populate('jobId');

    res.json(jobMatch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const ignoreJob = async (req, res) => {
  try {
    const jobMatch = await JobMatch.findOneAndUpdate(
      {
        userId: req.user._id,
        jobId: req.params.id
      },
      {
        isIgnored: true
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json({ message: 'Job ignored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

