import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsing for JSON and raw text
  app.use(express.json({ limit: '15mb' }));
  app.use(express.text({ limit: '15mb', type: ['text/*', 'application/json'] }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // API Proxy Route for Google Apps Script to eliminate all browser CORS and iframe fetch restrictions
  app.all('/api/gas-proxy', async (req, res) => {
    try {
      const targetUrl = (req.query.url as string) || (typeof req.body === 'object' && req.body?.url) || '';
      if (!targetUrl || !targetUrl.startsWith('http')) {
        return res.status(400).json({ success: false, message: 'URL parameter is missing or invalid' });
      }

      const method = req.method;
      const fetchOptions: RequestInit = {
        method,
        redirect: 'follow',
      };

      if (method === 'POST') {
        let bodyContent = '';
        if (typeof req.body === 'string') {
          bodyContent = req.body;
        } else if (typeof req.body === 'object') {
          // If body contains payload, extract payload or stringify body
          const cleanBody = { ...req.body };
          delete cleanBody.url;
          bodyContent = JSON.stringify(cleanBody);
        }

        fetchOptions.headers = {
          'Content-Type': 'text/plain;charset=utf-8',
        };
        fetchOptions.body = bodyContent;
      }

      const gasResponse = await fetch(targetUrl, fetchOptions);
      const text = await gasResponse.text();

      try {
        const json = JSON.parse(text);
        return res.status(gasResponse.status).json(json);
      } catch {
        return res.status(gasResponse.status).send(text);
      }
    } catch (err: any) {
      console.error('GAS Proxy Server Error:', err);
      return res.status(500).json({
        success: false,
        message: `GAS Proxy Error: ${err.message || 'Failed to reach Google Apps Script'}`,
      });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
