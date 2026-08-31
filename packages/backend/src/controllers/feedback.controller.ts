import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Feedback, FeedbackCategory, FeedbackStatus } from '../models/Feedback';
import { User } from '../models/User';
import { Workspace } from '@devvolio/shared';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { Types } from 'mongoose';

/**
 * POST /api/v1/feedback
 * Submit user feedback
 */
export async function submitFeedback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('Authentication required to submit feedback', 401));
    }

    const { category, rating, title, message } = req.body;

    if (!title || !title.trim()) {
      return next(new AppError('Feedback title is required', 400));
    }
    if (!message || !message.trim()) {
      return next(new AppError('Feedback message is required', 400));
    }

    // Lookup user details
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User profile not found', 404));
    }

    // Lookup active workspace (if any)
    const headerTenantId = req.headers['x-tenant-id'];
    let workspace = null;

    if (headerTenantId && Types.ObjectId.isValid(headerTenantId as string)) {
      workspace = await Workspace.findById(headerTenantId);
    }

    if (!workspace) {
      workspace = await Workspace.findOne({ owner: new Types.ObjectId(userId) });
    }

    const newFeedback = new Feedback({
      userId: new Types.ObjectId(userId),
      workspaceId: workspace?._id ? new Types.ObjectId(workspace._id) : undefined,
      userName: user.name || user.username || 'Anonymous Developer',
      userEmail: user.email,
      workspaceSlug: workspace?.slug || undefined,
      category: category || 'general',
      rating: rating !== undefined ? Math.min(5, Math.max(1, Number(rating))) : 5,
      title: title.trim(),
      message: message.trim(),
      status: 'pending'
    });

    await newFeedback.save();

    return sendSuccess(res, newFeedback, 'Feedback submitted successfully. Thank you for helping improve Devvolio!', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/feedback/my
 * Retrieve feedback history for the authenticated user
 */
export async function getMyFeedback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    const feedbacks = await Feedback.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, feedbacks, 'User feedback history retrieved');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/feedback/admin/all
 * Superadmin endpoint to retrieve all feedback with statistics and filtering
 */
export async function getAllFeedbackForAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { category, status, rating, search, page = '1', limit = '25' } = req.query;

    const query: Record<string, any> = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (rating && rating !== 'all') {
      query.rating = Number(rating);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { userName: searchRegex },
        { userEmail: searchRegex },
        { workspaceSlug: searchRegex },
        { title: searchRegex },
        { message: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const [feedbacks, totalMatching, totalAll, pendingCount, inProgressCount, resolvedCount, reviewedCount, ratingAgg] = await Promise.all([
      Feedback.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Feedback.countDocuments(query),
      Feedback.countDocuments({}),
      Feedback.countDocuments({ status: 'pending' }),
      Feedback.countDocuments({ status: 'in_progress' }),
      Feedback.countDocuments({ status: 'resolved' }),
      Feedback.countDocuments({ status: 'reviewed' }),
      Feedback.aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' }
          }
        }
      ])
    ]);

    const avgRating = ratingAgg.length > 0 && ratingAgg[0].avgRating
      ? Number(ratingAgg[0].avgRating.toFixed(1))
      : 5.0;

    const stats = {
      total: totalAll,
      pending: pendingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      reviewed: reviewedCount,
      avgRating
    };

    const pagination = {
      total: totalMatching,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(totalMatching / limitNum) || 1
    };

    return sendSuccess(res, { feedbacks, stats, pagination }, 'Platform feedback retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/feedback/admin/:id
 * Superadmin endpoint to update feedback review status or internal notes
 */
export async function updateFeedbackStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const feedbackId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { status, adminNotes } = req.body;

    if (!feedbackId || !Types.ObjectId.isValid(feedbackId)) {
      return next(new AppError('Invalid feedback ID format', 400));
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return next(new AppError('Feedback record not found', 404));
    }

    if (status) {
      const validStatuses: FeedbackStatus[] = ['pending', 'reviewed', 'in_progress', 'resolved'];
      if (!validStatuses.includes(status)) {
        return next(new AppError('Invalid feedback status value', 400));
      }
      feedback.status = status;
    }

    if (adminNotes !== undefined) {
      feedback.adminNotes = adminNotes;
    }

    await feedback.save();

    return sendSuccess(res, feedback, 'Feedback record updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/feedback/admin/:id
 * Superadmin endpoint to delete feedback
 */
export async function deleteFeedback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const feedbackId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

    if (!feedbackId || !Types.ObjectId.isValid(feedbackId)) {
      return next(new AppError('Invalid feedback ID format', 400));
    }

    const feedback = await Feedback.findByIdAndDelete(feedbackId);
    if (!feedback) {
      return next(new AppError('Feedback record not found', 404));
    }

    return sendSuccess(res, { id: feedbackId }, 'Feedback deleted successfully');
  } catch (error) {
    next(error);
  }
}
