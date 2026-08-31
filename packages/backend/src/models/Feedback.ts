import mongoose, { Schema, Document, Types } from 'mongoose';

export type FeedbackCategory = 'ui_ux' | 'feature_request' | 'bug' | 'performance' | 'update' | 'general';
export type FeedbackStatus = 'pending' | 'reviewed' | 'in_progress' | 'resolved';

export interface IFeedback extends Document {
  userId: Types.ObjectId;
  workspaceId?: Types.ObjectId;
  userName: string;
  userEmail: string;
  workspaceSlug?: string;
  category: FeedbackCategory;
  rating: number;
  title: string;
  message: string;
  status: FeedbackStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
      index: true
    },
    workspaceSlug: {
      type: String,
      trim: true,
      index: true
    },
    category: {
      type: String,
      enum: ['ui_ux', 'feature_request', 'bug', 'performance', 'update', 'general'],
      default: 'general',
      index: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    title: {
      type: String,
      required: [true, 'Feedback title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'in_progress', 'resolved'],
      default: 'pending',
      index: true
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Admin notes cannot exceed 2000 characters']
    }
  },
  {
    timestamps: true
  }
);

FeedbackSchema.index({ createdAt: -1 });

export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
export default Feedback;
