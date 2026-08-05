import { Schema, model, Document } from 'mongoose';

export interface IOtpVerification extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

const otpVerificationSchema = new Schema<IOtpVerification>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } } // Auto delete expired OTPs
  },
  { timestamps: true }
);

export const OtpVerification = model<IOtpVerification>('OtpVerification', otpVerificationSchema);
