# Yashkumar Jais Premium Developer Portfolio

A world-class, premium developer portfolio website and admin portal. Designed with luxury dark mode aesthetics, smooth animations (GSAP & Framer Motion), and Lenis scrolling, driven by a secure, rate-limited Express REST API with MongoDB Atlas and Cloudinary asset uploads.

## Project Architecture
The codebase is split into two independent services:
- `/backend`: Node/Express REST API written in TypeScript, featuring cookie JWT auth, mongoose schema validations, rate-limiting, and Cloudinary media upload channels.
- `/frontend`: Next.js App Router client written in TypeScript, styled with Tailwind CSS, utilizing GSAP animations and a secure Zustand dashboard session check.

---

## 1. Local Development Setup

### Prerequisites
- **NodeJS** (v18 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection string)
- **Cloudinary** (Account credentials to store project media uploads)

### Step 1: Environment Variables
Create a `.env` configuration file in both directories:

**Backend (`/backend/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/portfolio?retryWrites=true&w=majority
JWT_SECRET=generate_a_very_long_secure_random_string_here
JWT_COOKIE_EXPIRE=7
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:3000

# Default administrator credentials for database seeding
PORTFOLIO_ADMIN_EMAIL=lakshraj2121@gmail.com
PORTFOLIO_ADMIN_PASSWORD=AdminYash97!
```

**Frontend (`/frontend/.env`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Step 2: Install and Start Services

**Initialize Backend:**
```bash
cd backend
npm install
npm run dev
```

**Initialize Frontend:**
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public portfolio and [http://localhost:3000/admin](http://localhost:3000/admin) to access the dashboard portal.

### Step 3: Seeding Resume Data
Populate your database collections with Yashkumar Jais's professional experience, projects, and skills:
```bash
cd backend
npm run seed
```

---

## 2. Production Deployment Guide

### A. Backend Deployment (e.g., Render)
1. Link your GitHub repository to **Render** and create a **Web Service**.
2. Set **Root Directory** to `backend`.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. Add all environment variables listed in the `/backend/.env` checklist.
5. Once deployed, seed the production database via the Render shell or build-hook using:
   ```bash
   npm run seed:prod
   ```

### B. Frontend Deployment (e.g., Vercel)
1. Add a new project on **Vercel** linking your repository.
2. Set **Root Directory** to `frontend`.
3. Select **Next.js** framework preset.
4. Set the Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render Web Service URL ending in `/api/v1` (e.g., `https://portfolio-api.onrender.com/api/v1`).
5. Click **Deploy**. Vercel will automatically compile, optimize, and serve your application.

---

## 3. Operations & Maintenance
- **Media Assets**: When creating/editing projects inside the Admin Portal, use the file uploader. Uploaded thumbnails are sent directly to Cloudinary and return secure URLs automatically.
- **Form Messages**: Inquiry emails submitted by visitors are rate-limited per IP address to prevent spam, and they are saved to your MongoDB instance. You can read/delete them under the **Messages** panel on the Admin Dashboard.
