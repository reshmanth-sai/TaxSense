import compression from 'compression';
import express from 'express';
import path from 'path';
import healthHandler from './api/health';
import financeNewsHandler from './api/finance-news';
import extractPdfHandler from './api/extract-pdf';
import extractHandler from './api/extract';
import chatHandler from './api/chat';

const app = express();

// gzip/brotli every text response. The built client is ~2.4 MB of JS/CSS across
// 62 hashed chunks; uncompressed that is what every visitor downloads, and the
// entry chunk alone drops 541 kB -> 163 kB once this is on. Registered before
// any route so it covers both the static bundle and the JSON/SSE API responses.
// The SSE chat stream sets `Cache-Control: no-transform` (see /api/chat), which
// compression honours by skipping it, so token-by-token streaming is unaffected.
app.use(compression());

app.use(express.json());

// Trust proxy if deployed behind a reverse proxy (e.g. Vercel, Cloudflare, Nginx)
app.set('trust proxy', 1);

// API: these mount the exact same handler functions Vercel's filesystem-first
// routing serves directly in production (see services/rateLimit.ts) -- kept
// here, rather than reimplemented, so local dev (`tsx server.ts`) and local
// Node hosting (`node dist/server.cjs`) get working, non-duplicated endpoints
// too. The `as any` casts are the same Vercel-handler/Express-handler param
// mismatch api/extract-pdf.ts already works around locally.
app.get('/api/health', healthHandler as any);
app.get('/api/finance-news', financeNewsHandler as any);
app.post('/api/extract-pdf', extractPdfHandler as any);
app.post('/api/extract', extractHandler as any);
app.post('/api/chat', chatHandler as any);

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Vite static middleware serving or production fallback
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');

    // Vite fingerprints every emitted asset (index-5DhPlemr.js), so the content
    // at a given /assets/ URL can never change -- a year of immutable caching is
    // safe and skips the revalidation round-trip on repeat visits. index.html is
    // the one unhashed file and points at the current hashes, so it must always
    // be revalidated or a returning visitor boots the previous deploy's chunks.
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      immutable: true,
      maxAge: '1y',
    }));
    app.use(express.static(distPath, {
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      },
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`TaxSense server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
