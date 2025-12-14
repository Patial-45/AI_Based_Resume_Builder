import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobDescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
    required: true
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  scoreBreakdown: {
    semanticMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    keywordMatch: {
      type: Number,
      min: 0,
      max: 100
    },
    roleAlignment: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  missingKeywords: [{
    keyword: String,
    category: String,
    importance: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    suggestion: String
  }],
  recommendations: [{
    section: String,
    suggestion: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],
  strengths: [String],
  weaknesses: [String]
}, {
  timestamps: true
});

matchSchema.index({ userId: 1, createdAt: -1 });
matchSchema.index({ resumeId: 1, jobDescriptionId: 1 });

const Match = mongoose.model('Match', matchSchema);

export default Match;

