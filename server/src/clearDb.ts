import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clearDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hor-invoice';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('Connected to Database.');

    const collections = mongoose.connection.collections;
    
    // Loop through all active collections and wipe their documents
    for (const key in collections) {
      if (Object.prototype.hasOwnProperty.call(collections, key)) {
        const collection = collections[key];
        await collection.deleteMany({});
        console.log(`Cleared collection: ${key}`);
      }
    }
    
    console.log("SUCCESS: All records have been successfully vanished from the database.");
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    // Ensure the connection is closed after execution
    await mongoose.disconnect();
    console.log('Disconnected from Database.');
    process.exit(0);
  }
};

clearDatabase();