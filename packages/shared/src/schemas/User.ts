import mongoose, { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  name?: string;
  email: string;
  mobile?: string;
  password?: string;
  provider: 'local' | 'google' | 'github';
  providerId?: string;
  avatarUrl?: string;
  role: 'super_admin' | 'admin' | 'user' | 'team_member';
  workspaces: Types.ObjectId[];
  activeWorkspaceId?: Types.ObjectId;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  rememberMeToken?: string;
  refreshToken?: string;
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [4, 'Username must be at least 4 characters']
  },
  name: { type: String },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  mobile: { type: String, trim: true },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
  providerId: { type: String },
  avatarUrl: { type: String },
  role: { type: String, enum: ['super_admin', 'admin', 'user', 'team_member'], default: 'user' },
  workspaces: [{ type: Schema.Types.ObjectId, ref: 'Workspace' }],
  activeWorkspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isTwoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  rememberMeToken: String,
  refreshToken: String
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.models.User || model<IUser>('User', UserSchema);
