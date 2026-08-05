import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IAIParsingResult extends Document {
  tenantId: Types.ObjectId;
  resumeId: Types.ObjectId;
  rawJson: Record<string, any>;
  confidenceScores: {
    hero: number;
    about: number;
    education: number;
    experience: number;
    skills: number;
    projects: number;
    certificates: number;
    contact: number;
    overall: number;
  };
  mappedState: 'pending_review' | 'applied' | 'discarded';
  duplicatesDetected: Array<{
    collectionName: string;
    existingId: string;
    existingTitle: string;
    newTitle: string;
  }>;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const AIParsingResultSchema = new Schema<IAIParsingResult>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
  rawJson: { type: Schema.Types.Mixed, required: true },
  confidenceScores: {
    hero: { type: Number, default: 0 },
    about: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    skills: { type: Number, default: 0 },
    projects: { type: Number, default: 0 },
    certificates: { type: Number, default: 0 },
    contact: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },
  mappedState: { type: String, enum: ['pending_review', 'applied', 'discarded'], default: 'pending_review', index: true },
  duplicatesDetected: [{
    collectionName: { type: String, required: true },
    existingId: { type: String, required: true },
    existingTitle: { type: String, required: true },
    newTitle: { type: String, required: true }
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const AIParsingResult = mongoose.models.AIParsingResult || model<IAIParsingResult>('AIParsingResult', AIParsingResultSchema);
