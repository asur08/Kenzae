import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { generateSariModelDrape, GenerateDrapePayload } from './api/generate-drape.ts';

function kenzaeAiDrapeDevMiddleware(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    name: 'kenzae-ai-drape-dev-api',
    configureServer(server) {
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
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), kenzaeAiDrapeDevMiddleware(mode)],
  server: {
    port: 3000,
    open: false,
  },
}));
