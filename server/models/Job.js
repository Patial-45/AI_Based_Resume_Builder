import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: String,
    default: null
  },
  remote: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    required: true,
    enum: ['indeed', 'linkedin', 'glassdoor', 'monster', 'ziprecruiter', 'other']
  },
  sourceUrl: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  keywords: [String],
  requirements: [String],
  embedding: {
    type: [Number],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastScraped: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ sourceUrl: 1 }, { unique: true });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ source: 1, isActive: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;

