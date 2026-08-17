import mongoose from 'mongoose';

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume-builder';
  const fallbackUri = 'mongodb://127.0.0.1:27017/resume-builder';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (primaryError) {
    console.error(`❌ Primary MongoDB Connection Failed: ${primaryError.message}`);

    if (primaryUri !== fallbackUri) {
      console.log('🔄 Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/resume-builder)...');
      try {
        const fallbackConn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`✅ Local MongoDB Connected: ${fallbackConn.connection.host}`);
        return fallbackConn;
      } catch (fallbackError) {
        console.error(`❌ Local MongoDB Fallback Failed: ${fallbackError.message}`);
      }
    }

    console.error('\n📌 TROUBLESHOOTING MONGODB CONNECTION:');
    if (primaryError.message.includes('ENOTFOUND') || primaryError.message.includes('querySrv')) {
      console.error('1. Check your internet connection (DNS lookup for MongoDB Atlas failed).');
      console.error('2. Verify the cluster URI in server/.env (e.g. cluster0.jplk20h.mongodb.net).');
      console.error('3. Ensure your current IP is added to Network Access in MongoDB Atlas (or 0.0.0.0/0).');
      console.error('4. Alternatively, run local MongoDB or update MONGODB_URI in server/.env to: mongodb://127.0.0.1:27017/resume-builder\n');
    }

    process.exit(1);
  }
};

export default connectDB;


