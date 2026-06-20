import dotenv from 'dotenv';
dotenv.config();

import { v2 as cloudinary } from 'cloudinary';

console.log('Configuring Cloudinary...');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing upload stream with dummy buffer...');
const buffer = Buffer.from('test image data');

try {
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'test_folder' },
    (error, result) => {
      console.log('Callback fired!');
      if (error) {
        console.error('Error in callback:', error.message);
      } else {
        console.log('Result in callback:', result);
      }
      process.exit(0);
    }
  );

  uploadStream.on('error', (err) => {
    console.error('Stream error event:', err.message);
    process.exit(1);
  });

  uploadStream.end(buffer);
} catch (err: any) {
  console.error('Synchronous catch:', err.message);
  process.exit(1);
}

setTimeout(() => {
  console.log('Timeout reached. Closing.');
  process.exit(0);
}, 5000);
