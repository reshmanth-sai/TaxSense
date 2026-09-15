import { describe, it, expect, vi } from 'vitest';
import { enforceSameOrigin, pruneExpiredBuckets } from '../../services/rateLimit';

describe('API Origin & Cross-Site Security Enforcement', () => {
  const createMockResponse = () => {
    const res: any = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader: vi.fn((key: string, val: string) => {
        res.headers[key] = val;
      }),
      status: vi.fn((code: number) => {
        res.statusCode = code;
        return {
          json: vi.fn((body: any) => {
            res.body = body;
          }),
        };
      }),
    };
    return res;
  };

  it('rejects cross-site requests identified by Sec-Fetch-Site', () => {
    const req = {
      headers: {
        'sec-fetch-site': 'cross-site',
        origin: 'https://evil-tracker.example.com',
      },
    };
    const res = createMockResponse();

    const blocked = enforceSameOrigin(req, res);
    expect(blocked).toBe(true);
    expect(res.statusCode).toBe(403);
    expect(res.body?.error).toContain('Cross-site requests');
  });

  it('rejects unauthorized external Origin headers', () => {
    const req = {
      headers: {
        origin: 'https://unauthorized-phishing-domain.com',
        host: 'taxsense-copilot.vercel.app',
      },
    };
    const res = createMockResponse();

    const blocked = enforceSameOrigin(req, res);
    expect(blocked).toBe(true);
    expect(res.statusCode).toBe(403);
    expect(res.body?.error).toContain('Unauthorized origin');
  });

  it('allows requests from matching Host origin', () => {
    const req = {
      headers: {
        origin: 'https://taxsense-copilot.vercel.app',
        host: 'taxsense-copilot.vercel.app',
        'sec-fetch-site': 'same-origin',
      },
    };
    const res = createMockResponse();

    const blocked = enforceSameOrigin(req, res);
    expect(blocked).toBe(false);
    expect(res.statusCode).toBe(200);
  });

  it('allows requests from localhost dev servers', () => {
    const req = {
      headers: {
        origin: 'http://localhost:3000',
        host: 'localhost:3000',
        'sec-fetch-site': 'same-origin',
      },
    };
    const res = createMockResponse();

    const blocked = enforceSameOrigin(req, res);
    expect(blocked).toBe(false);
    expect(res.statusCode).toBe(200);
  });

  it('allows valid requests when Origin header is omitted (e.g. server-to-server or direct API)', () => {
    const req = {
      headers: {
        host: 'taxsense-copilot.vercel.app',
      },
    };
    const res = createMockResponse();

    const blocked = enforceSameOrigin(req, res);
    expect(blocked).toBe(false);
  });
});

describe('Rate Limiter Memory Guard & Pruning', () => {
  it('runs pruneExpiredBuckets without throwing errors', () => {
    expect(() => pruneExpiredBuckets(Date.now())).not.toThrow();
  });
});
