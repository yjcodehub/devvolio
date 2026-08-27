import { Response, NextFunction } from 'express';
import { Message } from '../models/Message';
import { Workspace } from '@devvolio/shared';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import { getTenantIdFromRequest } from '../utils/tenantHelper';
import { Types } from 'mongoose';

export async function createMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, email, subject, message, tenantId, slug } = req.body;

    if (!name || !email || !subject || !message) {
      return next(new AppError('All message fields (name, email, subject, message) are required', 400));
    }

    let resolvedTenantId: Types.ObjectId | null = null;
    if (tenantId && Types.ObjectId.isValid(tenantId)) {
      resolvedTenantId = new Types.ObjectId(tenantId);
    } else if (slug) {
      const ws = await Workspace.findOne({ slug: slug.toLowerCase() });
      if (ws) resolvedTenantId = ws._id as Types.ObjectId;
    } else {
      resolvedTenantId = await getTenantIdFromRequest(req);
    }

    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      tenantId: resolvedTenantId || undefined
    });

    await newMessage.save();
    return sendSuccess(res, newMessage, 'Your message has been sent successfully. Thank you!', 201);
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenantId = await getTenantIdFromRequest(req);
    const filter: any = {};
    if (tenantId) filter.tenantId = tenantId;

    // Sort by most recent first
    const list = await Message.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, list, 'Messages inbox list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function toggleMessageRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const tenantId = await getTenantIdFromRequest(req);
    const filter: any = { _id: id };
    if (tenantId) filter.tenantId = tenantId;

    const messageItem = await Message.findOne(filter);

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

export async function deleteMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const tenantId = await getTenantIdFromRequest(req);
    const filter: any = { _id: id };
    if (tenantId) filter.tenantId = tenantId;

    const msg = await Message.findOneAndDelete(filter);

    if (!msg) {
      return next(new AppError('Message not found', 404));
    }

    return sendSuccess(res, null, 'Message deleted successfully');
  } catch (error) {
    next(error);
  }
}
