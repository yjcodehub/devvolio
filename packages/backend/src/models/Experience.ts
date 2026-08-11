import { Schema, model } from 'mongoose';

const ExperienceSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    index: true
  },
  role: {
    type: String,
    required: [true, 'Job title / Degree title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company / University name is required'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['work', 'education'],
    default: 'work',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date // Can be null if isCurrent is true
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  highlights: [{
    type: String // Bullet points on deliverables
  }],
  skillsUsed: [{
    type: String // Tags corresponding to technical skills used
  }]
}, { timestamps: true });

ExperienceSchema.index({ tenantId: 1, startDate: -1 });
ExperienceSchema.index({ startDate: -1 });
ExperienceSchema.index({ type: 1 });

export const Experience = model('Experience', ExperienceSchema);
export default Experience;
