import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  slug: string; // Subdomain: slug.devvolio.in
  owner: Types.ObjectId;
  status: 'active' | 'suspended' | 'canceled';
  createdAt: Date;
  updatedAt: Date;
}

export const WorkspaceSchema = new Schema<IWorkspace>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'suspended', 'canceled'], default: 'active' }
}, { timestamps: true });

WorkspaceSchema.index({ slug: 1, status: 1 });

export const Workspace = mongoose.models.Workspace || model<IWorkspace>('Workspace', WorkspaceSchema);
