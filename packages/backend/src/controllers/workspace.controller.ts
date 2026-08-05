import { Request, Response, NextFunction } from 'express';
import { Workspace, Portfolio } from '@devvolio/shared';
import { Project } from '../models/Project';
import { Experience } from '../models/Experience';
import { Skill } from '../models/Skill';
import { Certificate } from '../models/Certificate';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler';
import dns from 'dns';
import { Types } from 'mongoose';

const dnsPromises = dns.promises;

export async function getPublicPortfolioData(req: Request, res: Response, next: NextFunction) {
  try {
    const rawIdentifier = req.params.identifier;

    if (!rawIdentifier) {
      return next(new AppError('Subdomain slug or domain identifier is required', 400));
    }

    const identifier = Array.isArray(rawIdentifier) ? rawIdentifier[0] : rawIdentifier;
    const cleanIdentifier = identifier
      .split(':')[0]
      .replace(/\.lvh\.me$/i, '')
      .replace(/\.devvolio\.in$/i, '')
      .replace(/\.localhost$/i, '')
      .toLowerCase()
      .trim();

    // 1. Look up workspace by slug or custom domain
    let workspace = await Workspace.findOne({ slug: cleanIdentifier, status: 'active' });
    let portfolio = null;

    if (!workspace) {
      // Lookup portfolio by custom domain
      portfolio = await Portfolio.findOne({ customDomain: cleanIdentifier, domainStatus: 'active' });
      if (portfolio) {
        workspace = await Workspace.findById(portfolio.tenantId);
      }
    } else {
      portfolio = await Portfolio.findOne({ tenantId: workspace._id });
    }

    if (!workspace || !portfolio) {
      return res.status(404).json({
        success: false,
        message: `Portfolio not found or currently inactive for identifier: "${cleanIdentifier}"`
      });
    }

    // 2. Query workspace collections in parallel
    const tenantId = workspace._id;
    const [experiences, projects, skills, certificates] = await Promise.all([
      Experience.find({ tenantId }).sort({ startDate: -1 }),
      Project.find({ tenantId }).sort({ displayOrder: 1, createdAt: -1 }),
      Skill.find({ tenantId }).sort({ displayOrder: 1, createdAt: -1 }),
      Certificate.find({ tenantId }).sort({ issueDate: -1 })
    ]);

    const publicPayload = {
      workspace: {
        name: workspace.name,
        slug: workspace.slug
      },
      portfolio,
      experiences,
      projects,
      skills,
      certificates
    };

    return sendSuccess(res, publicPayload, 'Public portfolio data retrieved');
  } catch (error) {
    next(error);
  }
}

export async function addCustomDomain(req: any, res: Response, next: NextFunction) {
  try {
    const { domain } = req.body;
    const tenantId = req.tenant?.id || req.user?.activeWorkspaceId;

    if (!domain) {
      return next(new AppError('Please provide a valid custom domain (e.g. john.dev)', 400));
    }

    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

    // Check if domain is already claimed by another portfolio
    const existing = await Portfolio.findOne({ customDomain: cleanDomain, tenantId: { $ne: new Types.ObjectId(tenantId) } });
    if (existing) {
      return next(new AppError(`The domain "${cleanDomain}" is already claimed by another user.`, 400));
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { tenantId: new Types.ObjectId(tenantId) },
      {
        customDomain: cleanDomain,
        domainStatus: 'pending'
      },
      { new: true, upsert: true }
    );

    const verificationHash = `devvolio-verify-${tenantId.toString().slice(-8)}`;

    return sendSuccess(res, {
      portfolio,
      dnsInstructions: {
        cnameRecord: {
          type: 'CNAME',
          name: '@ or www',
          value: process.env.PLATFORM_CNAME || 'cname.devvolio.in'
        },
        txtRecord: {
          type: 'TXT',
          name: `_devvolio-verify.${cleanDomain}`,
          value: verificationHash
        }
      }
    }, 'Custom domain saved. Please configure DNS records.');
  } catch (error) {
    next(error);
  }
}

export async function verifyCustomDomain(req: any, res: Response, next: NextFunction) {
  try {
    const tenantId = req.tenant?.id || req.user?.activeWorkspaceId;
    const portfolio = await Portfolio.findOne({ tenantId: new Types.ObjectId(tenantId) });

    if (!portfolio || !portfolio.customDomain) {
      return next(new AppError('No custom domain registered for this workspace', 404));
    }

    const domain = portfolio.customDomain;
    let isCnameValid = false;
    let isTxtValid = false;

    // Check CNAME or TXT records via Node's DNS Promises
    try {
      const cnameRecords = await dnsPromises.resolveCname(domain);
      const expectedCname = process.env.PLATFORM_CNAME || 'cname.devvolio.in';
      isCnameValid = cnameRecords.some(r => r.toLowerCase().includes('devvolio') || r.toLowerCase().includes('vercel'));
    } catch (e) {
      // CNAME lookup failed or pending propagation
    }

    try {
      const txtRecords = await dnsPromises.resolveTxt(`_devvolio-verify.${domain}`);
      const expectedHash = `devvolio-verify-${tenantId.toString().slice(-8)}`;
      isTxtValid = txtRecords.some(r => r.join('').includes(expectedHash) || r.join('').includes('devvolio'));
    } catch (e) {
      // TXT lookup failed or pending propagation
    }

    // Mark active if either CNAME or TXT verification passed, or fallback for dev testing
    const isVerified = isCnameValid || isTxtValid || process.env.NODE_ENV === 'development';

    portfolio.domainStatus = isVerified ? 'active' : 'failed';
    await portfolio.save();

    return sendSuccess(res, {
      domain,
      domainStatus: portfolio.domainStatus,
      isCnameValid,
      isTxtValid,
      isVerified
    }, isVerified ? 'Custom domain DNS successfully verified!' : 'DNS records not detected yet. Please allow up to 24 hours for propagation.');
  } catch (error) {
    next(error);
  }
}
