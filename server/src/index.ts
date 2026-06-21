import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000
});
app.use(limiter);

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hor-invoice';
    const db = await mongoose.connect(mongoUri);
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};

// Vercel Serverless: Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api', routes);
app.use(errorHandler);

// If not running in Vercel, start the server normally
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
  startServer();
}

export default app;
