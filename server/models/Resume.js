import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: { type: String, required: false },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  sections: {
    summary: String,
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      institution: String,
      year: String
    }],
    skills: [String],
    certifications: [String]
  },
  originalName: String,
  originalData: { type: Buffer, select: false },
  originalHash: { type: String, select: false },
  sourceText: { type: String, select: false },
  revision: { type: Number, default: 0 },
  reviewStatus: { type: String, enum: ['needs_review', 'ready'], default: 'needs_review' },
  reviewedAt: Date,
  deletionRequestedAt: Date,
  versions: { type: [{ revision: Number, text: String, savedAt: Date, sha256: String }], select: false, default: [] },
  embedding: {
    type: [Number],
    required: false,
    default: undefined
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
