import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateEnvironment } from '../services/ai/googleClient';
import { enforceRateLimit, API_RATE_LIMIT } from '../services/rateLimit';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (enforceRateLimit(req, res, 'api', API_RATE_LIMIT)) return;

  try {
    validateEnvironment();
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL ? 'Vercel Serverless' : 'Local Node'
    });
  } catch (error: any) {
    console.error('Health Check Failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Environment validation failed' 
    });
  }
}
