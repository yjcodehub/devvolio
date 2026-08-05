import mongoose, { Schema, Document, Types } from 'mongoose';

export type PlanType = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type BillingCycle = 'monthly' | 'yearly';

export interface ISubscriptionUsage {
  aiGenerationsCount: number;
  resumeParsesCount: number;
  resetAt: Date;
}

export interface ISubscription extends Document {
  tenantId: Types.ObjectId;
  plan: PlanType;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  priceInr: number;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  razorpayPaymentId?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  usage: ISubscriptionUsage;
  createdAt: Date;
  updatedAt: Date;
}

export const SubscriptionSchema = new Schema<ISubscription>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, unique: true },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  status: { type: String, enum: ['active', 'past_due', 'canceled', 'trialing'], default: 'active' },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  priceInr: { type: Number, default: 0 },
  razorpaySubscriptionId: { type: String, sparse: true },
  razorpayCustomerId: { type: String, sparse: true },
  razorpayPaymentId: { type: String },
  stripeSubscriptionId: { type: String, sparse: true },
  stripeCustomerId: { type: String, sparse: true },
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  usage: {
    aiGenerationsCount: { type: Number, default: 0 },
    resumeParsesCount: { type: Number, default: 0 },
    resetAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  }
}, { timestamps: true });

SubscriptionSchema.index({ plan: 1 });

export const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
