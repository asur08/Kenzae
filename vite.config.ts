import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { generateSariModelDrape, GenerateDrapePayload } from './api/generate-drape.ts';
import { authenticateStaff, verifySignedToken } from './api/auth/verify-staff.ts';
import { processImageUpload, UploadImageRequest } from './api/upload-image.ts';

function kenzaeDevApiMiddleware(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    name: 'kenzae-dev-api-middleware',
    configureServer(server) {
      // 1. Drape API
      server.middlewares.use('/api/generate-drape', (req, res, next) => {
        if (req.method !== 'POST') {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }
          return next();
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const payload = JSON.parse(rawBody || '{}') as GenerateDrapePayload;
            const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            const modelId = env.GEMINI_IMAGE_MODEL || process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

            const result = await generateSariModelDrape(payload, apiKey, modelId);
            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result.body));
          } catch (err) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'INVALID_REQUEST',
                message: err instanceof Error ? err.message : 'Invalid JSON payload.',
              })
            );
          }
        });
      });

      // 2. Staff Auth: Verify Passcode (/api/auth/verify-staff)
      server.middlewares.use('/api/auth/verify-staff', (req, res, next) => {
        if (req.method !== 'POST') {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }
          return next();
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const payload = JSON.parse(rawBody || '{}');
            const result = await authenticateStaff(payload);
            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result.body));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                error: 'AUTH_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Internal error',
              })
            );
          }
        });
      });

      // 3. Staff Auth: Check Session Token (/api/auth/check-session)
      server.middlewares.use('/api/auth/check-session', (req, res, next) => {
        if (req.method !== 'POST' && req.method !== 'GET') {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }
          return next();
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            let bodyToken = '';
            if (rawBody) {
              try {
                bodyToken = JSON.parse(rawBody)?.token || '';
              } catch {
                // Ignore parse errors on body
              }
            }

            const authHeader = (req.headers['authorization'] as string) || '';
            const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
            const token = headerToken || bodyToken;

            if (!token) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, valid: false, error: 'NO_TOKEN_PROVIDED' }));
              return;
            }

            const secret =
              env.STAFF_JWT_SECRET ||
              process.env.STAFF_JWT_SECRET ||
              'kenzae-boutique-secret-key-mulanthuruthy-2026';
            const verification = verifySignedToken(token, secret);

            if (!verification.valid) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, valid: false, error: 'INVALID_OR_EXPIRED_TOKEN' }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                valid: true,
                role: verification.payload?.role,
                expiresAt: verification.payload?.expiresAt,
              })
            );
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                valid: false,
                error: 'CHECK_SESSION_ERROR',
                message: err instanceof Error ? err.message : 'Error validating token',
              })
            );
          }
        });
      });

      // 4. Image Upload API (/api/upload-image)
      server.middlewares.use('/api/upload-image', (req, res, next) => {
        if (req.method !== 'POST') {
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }
          return next();
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const payload = JSON.parse(rawBody || '{}') as UploadImageRequest;
            const result = await processImageUpload(payload);
            res.statusCode = result.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result.body));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: false,
                error: 'UPLOAD_SERVER_ERROR',
                message: err instanceof Error ? err.message : 'Upload failed',
              })
            );
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), kenzaeDevApiMiddleware(mode)],
  server: {
    port: 3000,
    open: false,
  },
}));
