import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function gasProxyPlugin(): Plugin {
  return {
    name: 'gas-proxy-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/gas-proxy')) {
          try {
            const parsedUrl = new URL(req.url, 'http://localhost:3000');
            const targetUrl = parsedUrl.searchParams.get('url');
            if (!targetUrl || !targetUrl.startsWith('http')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: 'URL parameter is missing or invalid' }));
              return;
            }

            const method = req.method || 'GET';
            const fetchOptions: RequestInit = {
              method,
              redirect: 'follow',
            };

            if (method === 'POST') {
              const chunks: Buffer[] = [];
              for await (const chunk of req) {
                chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
              }
              const bodyData = Buffer.concat(chunks).toString('utf-8');
              fetchOptions.headers = {
                'Content-Type': 'text/plain;charset=utf-8',
              };
              fetchOptions.body = bodyData;
            }

            const gasRes = await fetch(targetUrl, fetchOptions);
            const text = await gasRes.text();

            res.statusCode = gasRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(text);
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: err?.message || 'Proxy error' }));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), gasProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
