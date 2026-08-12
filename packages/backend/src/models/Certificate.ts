import { Schema, model } from 'mongoose';

const CertificateSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    index: true
  },
  name: {
    type: String,
    required: [true, 'Certificate name is required'],
    trim: true
  },
  issuer: {
    type: String,
    required: [true, 'Issuing authority is required'],
    trim: true
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required']
  },
  expiryDate: {
    type: Date
  },
  credentialUrl: {
    type: String
  },
  thumbnail: {
    type: String // Cloudinary credential logo url
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

CertificateSchema.index({ tenantId: 1, order: 1 });
CertificateSchema.index({ order: 1 });

export const Certificate = model('Certificate', CertificateSchema);
export default Certificate;
