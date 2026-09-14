import { getAI, mapError, logStructured, DEFAULT_GEMINI_MODEL } from '../services/ai/googleClient';
import { enforceRateLimit, API_RATE_LIMIT, AI_RATE_LIMIT } from '../services/rateLimit';
import crypto from 'crypto';

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

    if (enforceRateLimit(req, res, 'api', API_RATE_LIMIT)) return;
    if (enforceRateLimit(req, res, 'ai', AI_RATE_LIMIT)) return;

    let base64Data: string = '';
    let mimeType: string = 'application/pdf';

    // Standard JSON payload containing base64 data
    if (req.body && (req.body.fileBase64 || req.body.data)) {
      base64Data = req.body.fileBase64 || req.body.data;
      mimeType = req.body.mimeType || 'application/pdf';
    }

    if (!base64Data) {
      return sendResponse(res, 400, { error: 'No file data received. Please upload a PDF, JPG, or PNG document.' });
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
            mimeType: mimeType.includes('image/') ? mimeType : 'application/pdf'
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
