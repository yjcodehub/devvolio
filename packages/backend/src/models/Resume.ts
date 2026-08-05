import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IResume extends Document {
  tenantId?: Types.ObjectId;
  fileName: string;
  fileUrl: string;
  publicId: string;
  resourceType: 'raw' | 'image';
  fileType: 'pdf' | 'doc' | 'docx';
  isActive: boolean;
  parsingStatus?: 'queued' | 'processing' | 'completed' | 'failed';
  aiParsingResultId?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Workspace', index: true },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  publicId: {
    type: String,
    required: [true, 'Public ID is required']
  },
  resourceType: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: ['raw', 'image']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: ['pdf', 'doc', 'docx']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  parsingStatus: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },
  aiParsingResultId: { type: Schema.Types.ObjectId, ref: 'AIParsingResult' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ResumeSchema.index({ isActive: 1 });

export const Resume = mongoose.models.Resume || model<IResume>('Resume', ResumeSchema);
export default Resume;
