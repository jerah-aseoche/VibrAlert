import mongoose from 'mongoose';

// Your MongoDB connection string
// IMPORTANT: Replace YOUR_PASSWORD with your actual password
const MONGODB_URI = "mongodb+srv://jerahaseoche_db_user:vibralert_123456@vibralert-cluster.lc81ngh.mongodb.net/vibralert_db";

const connectDB = async () => {
  try {
    // Removed deprecated options - they are now default
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`📍 Host: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('⚠️ Running without database - offline mode');
    return false;
  }
};

export default connectDB;