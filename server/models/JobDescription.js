import mongoose from 'mongoose';

const jobDescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['manual', 'url', 'portal'],
    default: 'manual'
  },
  url: {
    type: String,
    default: null
  },
  description: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  keywords: [String],
  requirements: [String],
  embedding: {
    type: [Number],
    default: null
  }
}, {
  timestamps: true
});

jobDescriptionSchema.index({ userId: 1, createdAt: -1 });

const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);

export default JobDescription;

