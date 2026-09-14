import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateContentStreamWithLogging, mapError, DEFAULT_GEMINI_MODEL } from '../services/ai/googleClient.js';
import { buildSystemPrompt, validateChatContext } from '../services/ai/promptBuilder.js';
import { enforceRateLimit, API_RATE_LIMIT, AI_RATE_LIMIT } from '../services/rateLimit.js';
import crypto from 'crypto';

// Bounds on what a single request may send to Gemini. The client trims its
// own history, so hitting these means a caller is bypassing the UI.
const MAX_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 4_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;

  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    if (enforceRateLimit(req, res, 'api', API_RATE_LIMIT)) return;
    if (enforceRateLimit(req, res, 'ai', AI_RATE_LIMIT)) return;

    // Set streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.write(`data: ${JSON.stringify({ error: 'Conversation messages array is required.' })}\n\n`);
      res.end();
      return;
    }
    if (messages.length > MAX_MESSAGES) {
      res.write(`data: ${JSON.stringify({ error: `Conversation too long (max ${MAX_MESSAGES} messages).` })}\n\n`);
      res.end();
      return;
    }
    for (const msg of messages) {
      if (!msg || typeof msg.content !== 'string' || msg.content.length > MAX_MESSAGE_CHARS) {
        res.write(`data: ${JSON.stringify({ error: `Each message must be a string of at most ${MAX_MESSAGE_CHARS} characters.` })}\n\n`);
        res.end();
        return;
      }
    }

    // See services/ai/promptBuilder.ts: the system prompt is built here from
    // a fixed template plus validated context, never from a client-supplied
    // prompt string.
    const validated = validateChatContext(context);
    if (validated.valid === false) {
      const errorMessage = 'Invalid context: ' + validated.error;
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
      return;
    }
    const systemPrompt = buildSystemPrompt(validated.context);

    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    try {
      const responseStream = await generateContentStreamWithLogging({
        model: DEFAULT_GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
        requestId,
        correlationId,
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        }
      }
      
      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (modelError: any) {
      // mapError is applied inside the helper, but if there's any other error we handle it
      const appErr = mapError(modelError);
      res.write(`data: ${JSON.stringify({ error: appErr.message })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }

  } catch (error: any) {
    const appErr = mapError(error);
    res.write(`data: ${JSON.stringify({ error: appErr.message })}\n\n`);
    res.end();
  }
}
