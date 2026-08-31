import { Schema, model } from 'mongoose';

const SkillSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    enum: [
      'Languages',
      'Frameworks & Libraries',
      'Databases',
      'DevOps & Cloud',
      'Tools & Platforms',
      'AI & Machine Learning',
      'UI/UX & Design',
      'Methodologies & Architecture',
      'Other'
    ],
    default: 'Frameworks & Libraries'
  },
  icon: {
    type: String, // React Icon tag (e.g. 'SiReact', 'SiTypescript', 'SiFigma')
    default: 'FaCode'
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

SkillSchema.index({ category: 1 });

export const Skill = model('Skill', SkillSchema);
export default Skill;
