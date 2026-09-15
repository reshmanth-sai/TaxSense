import { getAI, mapError, logStructured, DEFAULT_GEMINI_MODEL } from '../services/ai/googleClient.js';
import { enforceRateLimit, enforceSameOrigin, API_RATE_LIMIT, AI_RATE_LIMIT } from '../services/rateLimit.js';
import crypto from 'crypto';

// Mirrors the 3 MB client-side cap (see DocumentVault.tsx) with base64's 4/3
// overhead; Vercel would reject anything larger at the edge anyway.
const MAX_BASE64_CHARS = 4 * 1024 * 1024 * 4 / 3;
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

/**
 * Validates the file's binary magic bytes against its declared MIME type.
 * Decodes only the leading bytes of the base64 string for memory efficiency.
 */
function validateFileSignature(base64Data: string, mimeType: string): boolean {
  try {
    const prefixBuffer = Buffer.from(base64Data.slice(0, 64), 'base64');
    if (prefixBuffer.length < 4) return false;

    // PDF: %PDF- (0x25, 0x50, 0x44, 0x46)
    if (mimeType === 'application/pdf') {
      return prefixBuffer.subarray(0, 4).toString('ascii') === '%PDF';
    }
    // PNG: 0x89, 0x50, 0x4E, 0x47 (\x89PNG)
    if (mimeType === 'image/png') {
      return (
        prefixBuffer[0] === 0x89 &&
        prefixBuffer[1] === 0x50 &&
        prefixBuffer[2] === 0x4e &&
        prefixBuffer[3] === 0x47
      );
    }
    // JPEG: 0xFF, 0xD8, 0xFF
    if (mimeType === 'image/jpeg') {
      return prefixBuffer[0] === 0xff && prefixBuffer[1] === 0xd8 && prefixBuffer[2] === 0xff;
    }
    // WEBP: RIFF....WEBP
    if (mimeType === 'image/webp') {
      return (
        prefixBuffer.length >= 12 &&
        prefixBuffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        prefixBuffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    }
    return false;
  } catch {
    return false;
  }
}

function sendResponse(res: any, statusCode: number, data: any) {
  try {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(statusCode).json(data);
    }
  } catch {}
  try {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  } catch (err) {
    console.error('sendResponse error:', err);
  }
}

export default async function handler(req: any, res: any) {
  const requestId = (req.headers && req.headers['x-request-id']) || crypto.randomUUID();
  const correlationId = (req.headers && req.headers['x-correlation-id']) || requestId;
  const startTime = Date.now();

  try {
    if (req.method !== 'POST') {
      return sendResponse(res, 405, { error: 'Method Not Allowed' });
    }

    if (enforceSameOrigin(req, res)) return;
    if (enforceRateLimit(req, res, 'api', API_RATE_LIMIT)) return;
    if (enforceRateLimit(req, res, 'ai', AI_RATE_LIMIT)) return;

    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const base64Data: unknown = body.fileBase64 ?? body.data;
    const mimeType: string = typeof body.mimeType === 'string' ? body.mimeType.toLowerCase() : 'application/pdf';

    if (typeof base64Data !== 'string' || base64Data.length === 0) {
      return sendResponse(res, 400, { error: 'No file data received. Please upload a PDF, JPG, or PNG document.' });
    }
    if (base64Data.length > MAX_BASE64_CHARS) {
      return sendResponse(res, 413, { error: 'File is too large. Maximum upload size is 3 MB.' });
    }
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return sendResponse(res, 415, { error: 'Unsupported file type. Please upload a PDF, JPG, or PNG document.' });
    }
    if (!validateFileSignature(base64Data, mimeType)) {
      return sendResponse(res, 400, {
        error: 'Invalid file format or corrupted file signature. Please upload a genuine PDF, JPG, PNG, or WebP document.',
      });
    }

    logStructured('info', `Document received for extraction. Size: ~${Math.round(base64Data.length * 0.75)} bytes, type: ${mimeType}`, {
      requestId,
      correlationId,
      endpoint: 'extract-pdf',
    });

    const ai = getAI();

    logStructured('info', 'Sending document buffer to Gemini for extraction...', {
      requestId,
      correlationId,
      endpoint: 'extract-pdf',
      model: DEFAULT_GEMINI_MODEL,
    });
    
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType
          }
        },
        'Please extract all text content from this Form 16 document. Return ONLY the plain text characters from the document, preserving labels and values. Do not summarize or format as JSON.'
      ]
    });

    const latencyMs = Date.now() - startTime;
    logStructured('info', 'Successfully extracted document text content using Gemini', {
      requestId,
      correlationId,
      endpoint: 'extract-pdf',
      model: DEFAULT_GEMINI_MODEL,
      latencyMs,
    });

    return sendResponse(res, 200, { text: response.text || '' });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const appErr = mapError(error);
    
    logStructured('error', 'Error during document parsing / extraction', {
      requestId,
      correlationId,
      endpoint: 'extract-pdf',
      model: DEFAULT_GEMINI_MODEL,
      latencyMs,
      errorCategory: appErr.category,
      errorMessage: error.message || String(error),
      stackTrace: error.stack,
    });

    return sendResponse(res, appErr.status || 500, { error: appErr.message });
  }
}
