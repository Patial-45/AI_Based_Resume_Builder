import Match from '../models/Match.js';
import Resume from '../models/Resume.js';
import JobDescription from '../models/JobDescription.js';
import { matchResumeWithJD, generateKeywordSuggestions, getEmbedding, cosineSimilarity } from '../services/aiService.js';
import { analyzeResumeForJob } from '../services/resumeBuilder.js';

export const matchResumeWithJDController = async (req, res) => {
  try {
    const { resumeId, jobDescriptionId, jdText, title, company } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: 'Resume ID is required' });
    }

    // Get resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    let jobDescription;
    let jdTextFinal = jdText;

    // Get or create job description
    if (jobDescriptionId) {
      jobDescription = await JobDescription.findOne({
        _id: jobDescriptionId,
        userId: req.user._id
      });
      if (!jobDescription) {
        return res.status(404).json({ message: 'Job description not found' });
      }
      jdTextFinal = jobDescription.extractedText;
    } else if (jdText) {
      // Create new job description
      let embedding = null;
      try {
        embedding = await getEmbedding(jdText);
      } catch (error) {
        console.warn('Failed to generate embedding for job description:', error.message);
        // Continue without embedding - it's not critical
      }
      
      jobDescription = await JobDescription.create({
        userId: req.user._id,
        title: title || 'Untitled Job',
        company: company || 'Unknown',
        description: jdText,
        extractedText: jdText,
        embedding
      });
    } else {
      return res.status(400).json({ message: 'Job description text or ID is required' });
    }

    // Calculate semantic similarity using embeddings
    let semanticScore = 0;
    if (resume.embedding && jobDescription.embedding && 
        Array.isArray(resume.embedding) && Array.isArray(jobDescription.embedding) &&
        resume.embedding.length > 0 && jobDescription.embedding.length > 0) {
      try {
        const similarity = cosineSimilarity(resume.embedding, jobDescription.embedding);
        semanticScore = Math.round(similarity * 100);
      } catch (error) {
        console.warn('Error calculating cosine similarity:', error.message);
        semanticScore = 0;
      }
    }

    // Get AI-based matching
    let aiMatchResult;
    try {
      aiMatchResult = await matchResumeWithJD(
        resume.extractedText,
        jdTextFinal,
        resume.sections || {}
      );
    } catch (error) {
      console.error('Error in AI matching:', error);
      // Fallback to basic matching if AI fails
      aiMatchResult = {
        overallScore: semanticScore || 50,
        scoreBreakdown: {
          semanticMatch: semanticScore,
          keywordMatch: 50,
          roleAlignment: 50
        },
        missingKeywords: [],
        recommendations: [{
          section: 'General',
          suggestion: 'Unable to perform detailed analysis. Please check your API keys.',
          priority: 'medium'
        }],
        strengths: [],
        weaknesses: ['AI analysis unavailable']
      };
    }

    // Combine semantic score with AI scores
    const finalScore = Math.round(
      (semanticScore * 0.3 + aiMatchResult.overallScore * 0.7)
    );

    // Get detailed analysis for real-time improvements
    let detailedAnalysis = null;
    try {
      detailedAnalysis = await analyzeResumeForJob(
        resume.extractedText,
        jdTextFinal,
        resume.sections || {}
      );
    } catch (error) {
      console.warn('Failed to get detailed analysis, using basic match result:', error.message);
      // Continue with basic match result
    }

    // Create match record
    const match = await Match.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobDescriptionId: jobDescription._id,
      overallScore: finalScore,
      scoreBreakdown: {
        semanticMatch: semanticScore,
        keywordMatch: aiMatchResult.scoreBreakdown.keywordMatch,
        roleAlignment: aiMatchResult.scoreBreakdown.roleAlignment
      },
      missingKeywords: aiMatchResult.missingKeywords,
      recommendations: aiMatchResult.recommendations,
      strengths: aiMatchResult.strengths,
      weaknesses: aiMatchResult.weaknesses
    });

    // Return match with detailed analysis
    res.status(201).json({
      ...match.toObject(),
      detailedAnalysis: detailedAnalysis || {
        currentScore: finalScore,
        sectionAnalysis: {},
        keywordAnalysis: {
          matchedKeywords: [],
          missingKeywords: aiMatchResult.missingKeywords || []
        },
        priorityActions: aiMatchResult.recommendations?.map((rec, idx) => ({
          priority: idx + 1,
          action: rec.suggestion,
          impact: rec.priority,
          expectedScoreIncrease: rec.priority === 'high' ? 5 : rec.priority === 'medium' ? 3 : 1,
          location: rec.section
        })) || []
      }
    });
  } catch (error) {
    console.error('Error in match controller:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getMatches = async (req, res) => {
  try {
    const matches = await Match.find({ userId: req.user._id })
      .populate('resumeId', 'fileName')
      .populate('jobDescriptionId', 'title company')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('resumeId')
      .populate('jobDescriptionId');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getKeywordSuggestions = async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.matchId,
      userId: req.user._id
    })
      .populate('resumeId')
      .populate('jobDescriptionId');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const suggestions = await generateKeywordSuggestions(
      match.resumeId.extractedText,
      match.jobDescriptionId.extractedText
    );

    res.json({ suggestions, matchId: match._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

