import mongoose from 'mongoose';

const jobMatchSchema = new mongoose.Schema({
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
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  isSaved: {
    type: Boolean,
    default: false
  },
  isApplied: {
    type: Boolean,
    default: false
  },
  isIgnored: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

jobMatchSchema.index({ userId: 1, matchScore: -1 });
jobMatchSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const JobMatch = mongoose.model('JobMatch', jobMatchSchema);

export default JobMatch;

