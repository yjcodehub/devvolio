import { Schema, model } from 'mongoose';

const ProjectSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Project slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project summary/description is required']
  },
  detailedBody: {
    type: String // Markdown case study body
  },
  thumbnail: {
    type: String,
    required: [true, 'Project thumbnail image URL is required']
  },
  images: [{
    type: String // Additional slideshow / screenshot URLs
  }],
  videoUrl: {
    type: String // Cloudinary MP4 preview
  },
  githubUrl: {
    type: String
  },
  liveUrl: {
    type: String
  },
  technologies: [{
    type: String,
    required: [true, 'At least one technology tag is required']
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Frontend', 'Full Stack', 'SaaS', 'Other']
  },
  featured: {
    type: Boolean,
    default: false
  },
  stats: {
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 }
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Optimize query performance
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ order: 1 });

export const Project = model('Project', ProjectSchema);
export default Project;
