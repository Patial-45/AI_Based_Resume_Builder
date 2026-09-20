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
  country: {
    type: String,
    default: 'India',
    index: true
  },
  source: {
    type: String,
    required: true,
    enum: ['indeed', 'linkedin', 'glassdoor', 'naukri', 'iimjobs', 'unstop', 'foundit', 'remotive', 'jobicy', 'wellfound', 'itjobs', 'cutshort', 'hirist', 'hackernews', 'monster', 'ziprecruiter', 'sample', 'other']
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
jobSchema.index({ postedDate: -1 });
jobSchema.index({ source: 1, isActive: 1 });
// TTL index: Automatically purge jobs older than 3 days (259200 seconds)
jobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200 });

const Job = mongoose.model('Job', jobSchema);


export default Job;
