import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  _id: String, owner: String, expiresAt: { type: Date, required: true, expires: 0 }
});
export default mongoose.model('OperationLease', schema);

