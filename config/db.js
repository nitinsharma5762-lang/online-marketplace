import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 100, // Maintain up to 100 socket connections
      minPoolSize: 10,  // Keep at least 10 connections open
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Skip DNS resolution delays (IPv4 preference)
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;