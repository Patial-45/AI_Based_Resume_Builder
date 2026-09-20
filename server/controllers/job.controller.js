import Resume from '../models/Resume.js';
import Job from '../models/Job.js';
import JobMatch from '../models/JobMatch.js';
import User from '../models/User.js';
import { scanJobPortals, generateSampleJobs } from '../services/jobScraper.js';
import { cosineSimilarity } from '../services/aiService.js';

export const scanJobs = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: 'Resume ID is required' });
    }

    const resume = await Resume.findOne({ isActive: true,
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const user = await User.findById(req.user._id);
    const userPreferences = user.preferences || {};

    // Step 1: Check MongoDB for active jobs created within the last 3 days (72 hours)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const recentCachedJobs = await Job.find({
      createdAt: { $gte: threeDaysAgo },
      isActive: true
    }).sort({ createdAt: -1 }).limit(150);


    /* Provider payloads and account data must not be logged. */

    // Step 2: Perform live real-time India portal scanning
    let liveJobs = [];
    try {
      liveJobs = await scanJobPortals(
        resume.extractedText,
        resume.sections || {},
        userPreferences
      );
    } catch (error) {
      /* Provider payloads and account data must not be logged. */
      liveJobs = [];
    }

    // Step 3: Combine 3-day cached jobs with live scraped jobs (de-duplicating by ID/URL)
    const combinedJobMap = new Map();

    for (const job of [...liveJobs, ...recentCachedJobs]) {
      const key = job._id ? job._id.toString() : job.sourceUrl;
      if (!combinedJobMap.has(key)) {
        combinedJobMap.set(key, job);
      }
    }

    let jobs = Array.from(combinedJobMap.values());

    if (!jobs || jobs.length === 0) {
      /* Provider payloads and account data must not be logged. */
      jobs = await generateSampleJobs(
        resume.extractedText,
        resume.sections || {},
        userPreferences
      );
    }

    // Step 4: Calculate match scores for each job against this specific resume
    const jobMatches = [];
    for (const rawJob of jobs) {
      try {
        let job = rawJob;

        // Ensure job is saved in MongoDB so job._id is guaranteed to exist
        if (!job._id) {
          const sourceUrl = job.sourceUrl || job.link || `https://india-jobs.com/job/${encodeURIComponent((job.title || 'job').toLowerCase().replace(/\s+/g, '-'))}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          let existingJob = await Job.findOne({ sourceUrl });
          if (!existingJob) {
            existingJob = await Job.create({
              title: job.title || 'Software Developer',
              company: job.company || 'Tech Employer',
              location: job.location || 'India',
              country: 'India',
              remote: (job.location || '').toLowerCase().includes('remote'),
              source: job.source || 'sample',
              sourceUrl,
              description: job.description || job.snippet || `${job.title} position in India.`,
              extractedText: job.description || job.snippet || '',
              keywords: job.keywords || [],
              requirements: job.requirements || [],
              postedDate: new Date()
            });
          }
          job = existingJob;
        }

        if (!job || !job._id) continue;

        let matchScore = 50; // Default score

        // Calculate semantic similarity using embeddings
        if (resume.embedding && job.embedding &&
            Array.isArray(resume.embedding) && Array.isArray(job.embedding) &&
            resume.embedding.length > 0 && job.embedding.length > 0) {
          try {
            const similarity = cosineSimilarity(resume.embedding, job.embedding);
            matchScore = Math.round(similarity * 100);
          } catch (error) {
            /* Provider payloads and account data must not be logged. */
          }
        }

        // Create or update job match record
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
          jobMatch.resumeId = resume._id;
          jobMatch.matchScore = matchScore;
          await jobMatch.save();
        }

        jobMatches.push({
          job,
          match: jobMatch
        });
      } catch (error) {
        /* Provider payloads and account data must not be logged. */
      }
    }


    res.json({
      message: `Found ${jobMatches.length} matching active jobs for India`,
      jobs: jobMatches.sort((a, b) => b.match.matchScore - a.match.matchScore)
    });
  } catch (error) {
    /* Provider payloads and account data must not be logged. */
    next(error);
  }
};


export const getRecommendedJobs = async (req, res, next) => {
  try {
    const { resumeId, limit = 20 } = req.query;

    if (!resumeId) {
      return res.status(400).json({ message: 'Resume ID is required' });
    }

    const resume = await Resume.findOne({ isActive: true,
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
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
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
    next(error);
  }
};

export const saveJob = async (req, res, next) => {
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
    next(error);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await JobMatch.find({
      userId: req.user._id,
      isSaved: true
    })
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.json(savedJobs);
  } catch (error) {
    next(error);
  }
};

export const markJobAsApplied = async (req, res, next) => {
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
    next(error);
  }
};

export const ignoreJob = async (req, res, next) => {
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
    next(error);
  }
};
