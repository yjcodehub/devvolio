import { Schema, model } from 'mongoose';

const ProjectSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    index: true
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Project slug is required'],
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
    default: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
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
  technologies: {
    type: [String],
    default: ['Full Stack']
  },
  category: {
    type: String,
    enum: ['Frontend', 'Full Stack', 'SaaS', 'Other'],
    default: 'Full Stack'
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
ProjectSchema.index({ tenantId: 1, slug: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ order: 1 });

export const Project = model('Project', ProjectSchema);
export default Project;
