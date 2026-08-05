import { Schema, model } from 'mongoose';

const MessageSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Sender name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Sender email address is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

MessageSchema.index({ createdAt: -1 });

export const Message = model('Message', MessageSchema);
export default Message;
