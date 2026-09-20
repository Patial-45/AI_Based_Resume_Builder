import mongoose from 'mongoose';
export default async function connectDB(config) {
  // Never silently switch databases; fail before accepting requests.
  return mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 });
}
