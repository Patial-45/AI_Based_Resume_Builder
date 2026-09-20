import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  authVersion: { type: Number, default: 0 },
  csrfToken: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 }
}, { timestamps: true });
export default mongoose.model('Session', schema);

