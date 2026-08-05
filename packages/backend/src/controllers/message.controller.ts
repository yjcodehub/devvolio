import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';

export async function createMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return next(new AppError('All message fields (name, email, subject, message) are required', 400));
    }

    const newMessage = new Message({
      name,
      email,
      subject,
      message
    });

    await newMessage.save();
    return sendSuccess(res, newMessage, 'Your message has been sent successfully. Thank you!', 201);
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    // Sort by most recent first
    const list = await Message.find({}).sort({ createdAt: -1 });
    return sendSuccess(res, list, 'Messages inbox list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function toggleMessageRead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const messageItem = await Message.findById(id);

    if (!messageItem) {
      return next(new AppError('Message not found', 404));
    }

    // Toggle read state or use specific value if supplied in body
    messageItem.isRead = req.body.isRead !== undefined ? req.body.isRead : !messageItem.isRead;
    await messageItem.save();

    return sendSuccess(res, messageItem, `Message marked as ${messageItem.isRead ? 'read' : 'unread'}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const msg = await Message.findByIdAndDelete(id);

    if (!msg) {
      return next(new AppError('Message not found', 404));
    }

    return sendSuccess(res, null, 'Message deleted successfully');
  } catch (error) {
    next(error);
  }
}
