import { Schema, model } from 'mongoose';

const SkillSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    enum: [
      'Frameworks & Libraries',
      'Languages',
      'Tools & Platforms',
      'Domains',
      'Databases',
      'AI Tools',
      'Methodologies'
    ]
  },
  proficiency: {
    type: Number,
    min: [0, 'Proficiency cannot be less than 0'],
    max: [100, 'Proficiency cannot be more than 100'],
    default: 80
  },
  icon: {
    type: String // React Icon tag (e.g. 'SiReact', 'SiAngular')
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

SkillSchema.index({ category: 1 });
SkillSchema.index({ order: 1 });

export const Skill = model('Skill', SkillSchema);
export default Skill;
