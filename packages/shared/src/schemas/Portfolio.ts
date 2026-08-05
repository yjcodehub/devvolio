import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IPortfolio extends Document {
  tenantId: Types.ObjectId;
  customDomain?: string;
  domainStatus: 'pending' | 'active' | 'failed';
  templateId?: Types.ObjectId;
  hero: {
    title: string;
    subtitle: string;
    tagline?: string;
    terminalSequence: Array<{ type: 'input' | 'output'; text: string }>;
  };
  about: {
    bio: string;
    profileImage?: string;
    expertises: Array<{ icon: string; title: string; desc: string }>;
  };
  cvFileUrl?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords?: string[];
    openGraphImage?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
  };
  stats?: {
    githubUsername?: string;
    leetcodeEasySolved?: number;
    leetcodeEasyTotal?: number;
    leetcodeMediumSolved?: number;
    leetcodeMediumTotal?: number;
    leetcodeHardSolved?: number;
    leetcodeHardTotal?: number;
    spotifyIsPlaying?: boolean;
    spotifyTrackTitle?: string;
    spotifyTrackArtist?: string;
  };
  contact?: {
    title?: string;
    subtitle?: string;
    email?: string;
  };
  sectionVisibility?: Map<string, { label: string; visible: boolean }>;
  isPublished: boolean;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const PortfolioSchema = new Schema<IPortfolio>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  customDomain: { type: String, unique: true, sparse: true, index: true },
  domainStatus: { type: String, enum: ['pending', 'active', 'failed'], default: 'pending' },
  templateId: { type: Schema.Types.ObjectId, ref: 'Template' },
  hero: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    tagline: { type: String },
    terminalSequence: [{
      type: { type: String, enum: ['input', 'output'], required: true },
      text: { type: String, required: true }
    }]
  },
  about: {
    bio: { type: String, required: true },
    profileImage: { type: String },
    expertises: [{
      icon: { type: String, required: true },
      title: { type: String, required: true },
      desc: { type: String, required: true }
    }]
  },
  cvFileUrl: { type: String },
  socialLinks: {
    github: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    email: { type: String }
  },
  seo: {
    metaTitle: { type: String, required: true, default: 'Developer Portfolio' },
    metaDescription: { type: String, required: true, default: 'Welcome to my interactive developer portfolio.' },
    keywords: [{ type: String }],
    openGraphImage: { type: String }
  },
  analytics: {
    googleAnalyticsId: { type: String }
  },
  stats: {
    githubUsername: { type: String, default: 'yjcodehub' },
    leetcodeEasySolved: { type: Number, default: 142 },
    leetcodeEasyTotal: { type: Number, default: 200 },
    leetcodeMediumSolved: { type: Number, default: 210 },
    leetcodeMediumTotal: { type: Number, default: 450 },
    leetcodeHardSolved: { type: Number, default: 38 },
    leetcodeHardTotal: { type: Number, default: 150 },
    spotifyIsPlaying: { type: Boolean, default: false },
    spotifyTrackTitle: { type: String, default: 'Chill Vibes Loop' },
    spotifyTrackArtist: { type: String, default: 'Yash Jais Studio Mix' }
  },
  contact: {
    title: { type: String, default: "Let's Collaborate" },
    subtitle: { type: String, default: "Have an exciting project or role? Send me a message and let's start talking." },
    email: { type: String, default: "lakshraj2121@gmail.com" }
  },
  sectionVisibility: {
    type: Map,
    of: new Schema({
      label: { type: String, required: true },
      visible: { type: Boolean, default: true }
    }, { _id: false }),
    default: {
      skills: { label: 'Skills Section | Technical Arsenal', visible: true },
      core: { label: 'Core Section (About & Expertises)', visible: true },
      contact: { label: 'Contact Section', visible: true },
      developerMatrix: { label: 'Developer Matrix Section (GitHub, LeetCode, Spotify)', visible: true },
      motionTerminal: { label: 'Motion Terminal Section (Interactive Hero Widget)', visible: true },
      projects: { label: 'Projects Section (Grid & Filtering)', visible: true },
      experience: { label: 'Experience & Education Timeline Section', visible: true }
    }
  },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

PortfolioSchema.index({ tenantId: 1, isPublished: 1 });

export const Portfolio = mongoose.models.Portfolio || model<IPortfolio>('Portfolio', PortfolioSchema);
