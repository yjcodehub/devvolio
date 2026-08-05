# Database Design & Schemas

This document defines the complete MongoDB database design using Mongoose. The database is hosted on MongoDB Atlas and handles dynamically managed content for the developer portfolio.

---

## 1. Schema Specifications (Mongoose Types)

### 1.1 User / Admin Schema (`users`)
Used to store administrator authentication details.

```typescript
import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [4, 'Username must be at least 4 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  },
  refreshToken: {
    type: String
  }
}, { timestamps: true });

// Indexing
UserSchema.index({ email: 1 }, { unique: true });

export const User = model('User', UserSchema);
```

### 1.2 Project Schema (`projects`)
Defines both general projects and featured case studies.

```typescript
const ProjectSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  detailedBody: { type: String }, // Markdown format for Case Studies
  thumbnail: { type: String, required: true }, // Cloudinary URL
  images: [{ type: String }], // Cloudinary URLs for gallery slideshows
  videoUrl: { type: String }, // Cloudinary MP4 URL for hover playback
  githubUrl: { type: String },
  liveUrl: { type: String },
  technologies: [{ type: String, required: true }],
  category: { type: String, required: true, enum: ['Frontend', 'Full Stack', 'SaaS', 'Other'] },
  featured: { type: Boolean, default: false },
  stats: {
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 }
  },
  order: { type: Number, default: 0 } // Custom ordering for client sorting
}, { timestamps: true });

ProjectSchema.index({ slug: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ order: 1 });
```

### 1.3 Experience Schema (`experiences`)
Supports both work history and education timelines.

```typescript
const ExperienceSchema = new Schema({
  role: { type: String, required: true }, // e.g., 'Software Engineer' or 'B.E. in CS'
  company: { type: String, required: true }, // e.g., 'Relfor Labs Pvt Ltd' or 'College Name'
  location: { type: String },
  type: { type: String, enum: ['work', 'education'], default: 'work' },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // Null means 'Present' / 'Current'
  isCurrent: { type: Boolean, default: false },
  description: { type: String }, // General summary markdown
  highlights: [{ type: String }], // Bullet points on duties/achievements
  skillsUsed: [{ type: String }]  // Linked skill tags
}, { timestamps: true });

ExperienceSchema.index({ startDate: -1 });
ExperienceSchema.index({ type: 1 });
```

### 1.4 Skill Schema (`skills`)
Categorized technical assets.

```typescript
const SkillSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Frameworks & Libraries', 'Languages', 'Tools & Platforms', 'Databases', 'AI Tools', 'Methodologies']
  },
  proficiency: { type: Number, min: 0, max: 100, default: 80 }, // Numerical scale for visual gauges
  icon: { type: String }, // React Icon identifier name (e.g. 'SiReact', 'SiAngular')
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

SkillSchema.index({ category: 1 });
SkillSchema.index({ order: 1 });
```

### 1.5 Certificate Schema (`certificates`)

```typescript
const CertificateSchema = new Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date },
  credentialUrl: { type: String },
  thumbnail: { type: String }, // Cloudinary upload
  order: { type: Number, default: 0 }
}, { timestamps: true });

CertificateSchema.index({ order: 1 });
```

### 1.6 Site Settings Schema (`settings`)
Single document configuration for global toggles, SEO configurations, and CV links.

```typescript
const SettingsSchema = new Schema({
  hero: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    tagline: { type: String }
  },
  about: {
    bio: { type: String, required: true },
    profileImage: { type: String }
  },
  cvFileUrl: { type: String }, // Cloudinary link for Resume PDF
  socialLinks: {
    github: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    email: { type: String }
  },
  seo: {
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    keywords: [{ type: String }],
    openGraphImage: { type: String }
  },
  analytics: {
    googleAnalyticsId: { type: String }
  }
}, { timestamps: true });
```

### 1.7 Message Schema (`messages`)
Records messages submitted through the public contact form.

```typescript
const MessageSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

MessageSchema.index({ createdAt: -1 });
```

---

## 2. Initial Content Preload (Extracted Resume Data)

Upon backend startup, the database seeding script registers the initial developer details for **Yashkumar Jais**:

### 2.1 Initial Setting Payload
```json
{
  "hero": {
    "title": "Yashkumar Jais",
    "subtitle": "Software Engineer (Frontend)",
    "tagline": "Crafting premium user-centric web applications and high-fidelity interactive digital experiences."
  },
  "about": {
    "bio": "Frontend Software Engineer with 6+ years of experience building scalable, user-centric web applications using Angular and React. Proven track record in performance optimization, REST API integration, and delivering enterprise-grade SaaS products. Experienced in Agile environments, cross-functional collaboration, and mentoring junior developers. Passionate about clean code, responsive design, and continuous learning."
  },
  "socialLinks": {
    "github": "https://github.com/yjcodehub",
    "linkedin": "https://www.linkedin.com/in/yashjais97",
    "email": "lakshraj2121@gmail.com"
  },
  "seo": {
    "metaTitle": "Yashkumar Jais | Senior Frontend Engineer Portfolio",
    "metaDescription": "Explore the professional portfolio, experience, and projects of Yashkumar Jais, a Frontend Engineer specializing in Next.js, React, and Angular.",
    "keywords": ["Yashkumar Jais", "Frontend Engineer", "Angular Developer", "React Developer", "NextJS Portfolio", "Web Performance Optimization"]
  }
}
```

### 2.2 Work Experiences Payload
```json
[
  {
    "role": "Software Engineer (Frontend)",
    "company": "Relfor Labs Pvt Ltd",
    "location": "Pune",
    "type": "work",
    "startDate": "2022-05-01T00:00:00Z",
    "endDate": "2026-05-01T00:00:00Z",
    "isCurrent": false,
    "description": "Developed and maintained a restaurant management POS system handling billing, order processing, and inventory tracking.",
    "highlights": [
      "Built and optimized key modules including Digital Menu (GoDirekt), Inventory Management, and Kitchen Display System (KDS).",
      "Improved application performance by optimizing API calls and reducing page load time.",
      "Integrated REST APIs for seamless communication between frontend and backend systems.",
      "Enhanced system stability by identifying and resolving critical production bugs.",
      "Collaborated with cross-functional teams in an Agile environment to deliver scalable, production-ready features.",
      "Contributed to Respark, a Salon & Spa Management Software product (respark.in), building features for appointment booking, CRM, and payments."
    ],
    "skillsUsed": ["AngularJS", "React.js", "TypeScript", "REST APIs"]
  },
  {
    "role": "Trainer & Web Developer",
    "company": "Webgurukul",
    "location": "Nagpur",
    "type": "work",
    "startDate": "2019-05-01T00:00:00Z",
    "endDate": "2022-05-01T00:00:00Z",
    "isCurrent": false,
    "description": "Trained and mentored students in web engineering stacks while building user interfaces.",
    "highlights": [
      "Trained 350+ students in full-stack web development: HTML, CSS, JavaScript, Bootstrap, PHP, MySQL, and Responsive Web Design.",
      "Contributed to 150+ successful student placements across companies and MNCs.",
      "Designed and developed UI templates including dashboards, authentication systems, and admin panels.",
      "Mentored students on real-world projects, coding best practices, and interview preparation."
    ],
    "skillsUsed": ["JavaScript", "HTML5", "CSS3", "Bootstrap", "PHP", "MySQL"]
  }
]
```

### 2.3 Projects Payload
```json
[
  {
    "title": "FitPulse Pro",
    "slug": "fitpulse-pro",
    "description": "A mobile-first gym body analysis and BMI tracking system to digitize paper-based fitness workflows, featuring distinct dashboards and automated PDF reports.",
    "thumbnail": "cloudinary_placeholder_fitpulse",
    "githubUrl": "https://github.com/yjcodehub/bmitracker",
    "liveUrl": "https://fitpulsepro.vercel.app",
    "technologies": ["Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Express.js", "MongoDB"],
    "category": "Full Stack",
    "featured": true,
    "order": 1
  },
  {
    "title": "Respark",
    "slug": "respark",
    "description": "Cloud-based salon management platform automating appointment bookings, client relationships (CRM), and credit card checkouts.",
    "thumbnail": "cloudinary_placeholder_respark",
    "liveUrl": "https://respark.in",
    "technologies": ["React.js", "TypeScript", "REST APIs", "Tailwind CSS"],
    "category": "SaaS",
    "featured": true,
    "order": 2
  },
  {
    "title": "Devourin",
    "slug": "devourin",
    "description": "End-to-end POS and inventory display software designed for streamlined restaurant operations and real-time kitchen tracking.",
    "thumbnail": "cloudinary_placeholder_devourin",
    "technologies": ["AngularJS", "JavaScript", "REST APIs", "MySQL"],
    "category": "Frontend",
    "featured": false,
    "order": 3
  }
]
```

### 2.4 Skills Payload
```json
[
  { "name": "Angular", "category": "Frameworks & Libraries", "proficiency": 90, "featured": true },
  { "name": "React.js", "category": "Frameworks & Libraries", "proficiency": 85, "featured": true },
  { "name": "Next.js", "category": "Frameworks & Libraries", "proficiency": 80, "featured": true },
  { "name": "Node.js", "category": "Frameworks & Libraries", "proficiency": 75, "featured": false },
  { "name": "TypeScript", "category": "Languages", "proficiency": 88, "featured": true },
  { "name": "JavaScript (ES6+)", "category": "Languages", "proficiency": 92, "featured": true },
  { "name": "HTML5 & CSS3", "category": "Languages", "proficiency": 95, "featured": false },
  { "name": "MongoDB", "category": "Databases", "proficiency": 70, "featured": false },
  { "name": "Cursor AI / Copilot", "category": "AI Tools", "proficiency": 90, "featured": true }
]
```
