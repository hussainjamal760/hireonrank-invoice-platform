# HireOnRank Invoice Platform

**A Hackathon Project under [HireOnRank](https://app.hireonrank.com/)**

## Overview
This is a robust, full-stack Invoice Management Platform built for a hackathon. It streamlines the process of creating, managing, and tracking invoices, featuring an interactive dashboard, automated PDF generation, AI integrations, and direct email capabilities.

## Tech Stack

### Client (Frontend)
- **Framework:** Next.js (React)
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Data Visualization:** Recharts, React-Leaflet
- **PDF Export:** jsPDF, jsPDF-AutoTable
- **Icons:** Lucide React

### Server (Backend)
- **Environment:** Node.js & Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JSON Web Tokens (JWT)
- **AI Integration:** Groq SDK
- **File Storage:** Cloudinary & Multer
- **Email Delivery:** Nodemailer
- **Security:** Helmet & Express Rate Limit

## Key Features
- **Interactive Dashboard:** Gain insights with visual analytics, charts, and geographical mapping.
- **Invoice Management:** Easily create, edit, and export professional invoices in PDF format.
- **Direct Emailing:** Send invoices straight to clients from the platform.
- **Cloud Media Management:** Seamless image and document uploads via Cloudinary.
- **Secure Access:** Fully protected routes and user sessions using JWT.

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- MongoDB instance (local or Atlas)

### Server Setup
1. Navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables by creating a `.env` file (requires MongoDB URI, JWT Secret, Cloudinary keys, Groq API key, Nodemailer credentials).
4. Run the development server:
   ```bash
   npm run dev
   ```

### Client Setup
1. Navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## License
ISC License
