import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Workspace, Portfolio, Subscription } from '@devvolio/shared';
import { OtpVerification } from '../models/OtpVerification';
import { EmailService } from '../services/email.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
};

export async function checkSubdomain(req: Request, res: Response, next: NextFunction) {
  try {
    const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    if (!rawSlug) {
      return next(new AppError('Subdomain slug is required', 400));
    }

    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    if (cleanSlug.length < 3) {
      return sendSuccess(res, { slug: cleanSlug, available: false, reason: 'Subdomain must be at least 3 characters long' });
    }

    const existing = await Workspace.findOne({ slug: cleanSlug });
    return sendSuccess(res, { slug: cleanSlug, available: !existing });
  } catch (error) {
    next(error);
  }
}

export async function sendRegisterOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already registered
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return next(new AppError('An account with this email already exists. Please log in.', 400));
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Upsert OTP record
    await OtpVerification.deleteMany({ email: cleanEmail });
    await OtpVerification.create({
      email: cleanEmail,
      otp,
      expiresAt
    });

    // Dispatch OTP via EmailService
    await EmailService.sendOtpEmail(cleanEmail, otp);

    return sendSuccess(res, { email: cleanEmail }, '6-digit OTP verification code sent to your email.');
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, mobile, password, otp, desiredSubdomain } = req.body;

    if (!name || !email || !password || !otp) {
      return next(new AppError('Please provide name, email, password, and OTP code', 400));
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Verify OTP
    const otpRecord = await OtpVerification.findOne({ email: cleanEmail, otp });
    if (!otpRecord) {
      return next(new AppError('Invalid OTP verification code. Please check your email or request a new code.', 400));
    }

    if (otpRecord.expiresAt < new Date()) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      return next(new AppError('OTP verification code has expired. Please request a new code.', 400));
    }

    // Delete verified OTP record
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    // 2. Check if user email exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return next(new AppError('An account with this email already exists. Please log in.', 400));
    }

    // 3. Generate clean unique workspace slug
    let baseSlug = (desiredSubdomain || name || cleanEmail.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '') || 'dev';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Workspace.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
      counter++;
      if (counter > 20) break;
    }

    // 4. Generate unique username
    let baseUsername = (name || cleanEmail.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '') || 'dev_user';

    let uniqueUsername = baseUsername;
    let uCounter = 1;
    while (await User.findOne({ username: uniqueUsername })) {
      uniqueUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
      uCounter++;
      if (uCounter > 20) break;
    }

    const user = new User({
      username: uniqueUsername,
      name,
      email: cleanEmail,
      mobile: mobile ? mobile.trim() : undefined,
      password,
      role: 'user'
    });
    await user.save();

    // 5. Provision Workspace
    const workspace = new Workspace({
      name: `${name}'s Workspace`,
      slug: uniqueSlug,
      owner: user._id,
      status: 'active'
    });
    await workspace.save();

    // 6. Initialize Portfolio
    const portfolio = new Portfolio({
      tenantId: workspace._id,
      hero: {
        title: name,
        subtitle: 'Developer Portfolio',
        tagline: 'Welcome to my interactive developer portfolio powered by Devvolio.'
      },
      about: {
        bio: `${name} is a passionate developer crafting modern web applications.`,
        expertises: []
      },
      seo: {
        metaTitle: `${name} - Developer Portfolio`,
        metaDescription: `Welcome to ${name}'s interactive developer portfolio.`
      },
      stats: {
        githubUsername: '',
        leetcodeEasySolved: 0,
        leetcodeEasyTotal: 100,
        leetcodeMediumSolved: 0,
        leetcodeMediumTotal: 100,
        leetcodeHardSolved: 0,
        leetcodeHardTotal: 100
      },
      contact: {
        title: "Let's Connect",
        subtitle: 'Send me a message regarding projects or opportunities.',
        email: cleanEmail
      },
      createdBy: user._id,
      updatedBy: user._id
    });
    await portfolio.save();

    // 7. Initialize Subscription
    const subscription = new Subscription({
      tenantId: workspace._id,
      plan: 'free',
      status: 'active'
    });
    await subscription.save();

    // 8. Issue JWT Session Tokens
    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      workspace: {
        id: workspace._id,
        name: workspace.name,
        slug: workspace.slug
      }
    }, 'Email verified and workspace created successfully!', 201);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password credentials', 401));
    }

    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return sendSuccess(res, {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }, 'Login successful');

  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(new AppError('Session refresh token missing. Please log in again.', 401));
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return next(new AppError('Refresh token is invalid or expired. Log in again.', 401));
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return next(new AppError('Invalid session pairing. Please log in again.', 401));
    }

    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(payload);

    res.cookie('accessToken', newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000
    });

    return sendSuccess(res, null, 'Session access token refreshed');

  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.refreshToken;
    
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.userId);
        if (user) {
          user.refreshToken = undefined;
          await user.save();
        }
      } catch (err) {
        // Continue clearing cookies
      }
    }

    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const user = await User.findById(req.user.userId).select('-password -refreshToken');
    if (!user) {
      return next(new AppError('User profile not found', 404));
    }

    return sendSuccess(res, user, 'Active user session metadata loaded');
  } catch (error) {
    next(error);
  }
}
