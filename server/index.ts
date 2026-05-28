import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware';

const app = express();
const port = Number(process.env.PORT ?? 4000);
const databaseConfigured = Boolean(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// Root route for browser access
app.get('/', (_req, res) => {
  const dbStatusText = databaseConfigured ? 'configured' : 'not configured';
  const dbStatusColor = databaseConfigured ? '#10b981' : '#ef4444';

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Student App API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .container { background: white; border-radius: 12px; padding: 40px; max-width: 660px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { color: #333; margin-bottom: 10px; }
        .status { color: #667eea; font-size: 14px; margin-bottom: 10px; }
        .db-status { font-size: 13px; margin-bottom: 30px; }
        .status-dot { display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .endpoints { margin-top: 30px; }
        .endpoints h2 { font-size: 16px; color: #333; margin-bottom: 15px; margin-top: 20px; }
        .endpoint { background: #f5f5f5; padding: 12px; margin-bottom: 10px; border-left: 4px solid #667eea; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; color: #666; }
        .method { display: inline-block; font-weight: bold; padding: 2px 6px; border-radius: 3px; margin-right: 8px; }
        .get { background: #d1fae5; color: #065f46; }
        .post { background: #dbeafe; color: #0c4a6e; }
        .put { background: #fef3c7; color: #78350f; }
        .delete { background: #fee2e2; color: #7f1d1d; }
        a { color: #667eea; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎓 Student App API</h1>
        <div class="status"><span class="status-dot"></span>Server is running</div>
        <div class="db-status">Database status: <strong style="color: ${dbStatusColor};">${dbStatusText}</strong></div>
        <p style="margin-bottom: 24px; color: #555; font-size: 14px;">If the database is not configured, API routes will return a friendly configuration error. Set <code>DATABASE_URL</code> and restart the server to enable CRUD endpoints.</p>

        <h2 style="color: #333; margin-top: 0;">Quick Links</h2>
        <p><a href="/api/express/status" target="_blank">Health Check</a> • <a href="/api/users" target="_blank">Users</a> • <a href="/api/courses" target="_blank">Courses</a> • <a href="/api/assignments" target="_blank">Assignments</a> • <a href="/api/submissions" target="_blank">Submissions</a></p>

        <div class="endpoints">
          <h2>📋 Available Endpoints</h2>
          
          <h3 style="font-size: 14px; color: #667eea; margin-top: 20px; margin-bottom: 10px;">Users</h3>
          <div class="endpoint"><span class="method get">GET</span> /api/users</div>
          <div class="endpoint"><span class="method get">GET</span> /api/users/:id</div>
          <div class="endpoint"><span class="method post">POST</span> /api/users</div>
          <div class="endpoint"><span class="method put">PUT</span> /api/users/:id</div>
          <div class="endpoint"><span class="method delete">DELETE</span> /api/users/:id</div>

          <h3 style="font-size: 14px; color: #667eea; margin-top: 20px; margin-bottom: 10px;">Courses</h3>
          <div class="endpoint"><span class="method get">GET</span> /api/courses</div>
          <div class="endpoint"><span class="method get">GET</span> /api/courses/:id</div>
          <div class="endpoint"><span class="method post">POST</span> /api/courses</div>
          <div class="endpoint"><span class="method put">PUT</span> /api/courses/:id</div>
          <div class="endpoint"><span class="method delete">DELETE</span> /api/courses/:id</div>

          <h3 style="font-size: 14px; color: #667eea; margin-top: 20px; margin-bottom: 10px;">Assignments</h3>
          <div class="endpoint"><span class="method get">GET</span> /api/assignments</div>
          <div class="endpoint"><span class="method get">GET</span> /api/assignments/:id</div>
          <div class="endpoint"><span class="method post">POST</span> /api/assignments</div>
          <div class="endpoint"><span class="method put">PUT</span> /api/assignments/:id</div>
          <div class="endpoint"><span class="method delete">DELETE</span> /api/assignments/:id</div>

          <h3 style="font-size: 14px; color: #667eea; margin-top: 20px; margin-bottom: 10px;">Submissions</h3>
          <div class="endpoint"><span class="method get">GET</span> /api/submissions</div>
          <div class="endpoint"><span class="method get">GET</span> /api/submissions/:id</div>
          <div class="endpoint"><span class="method post">POST</span> /api/submissions</div>
          <div class="endpoint"><span class="method put">PUT</span> /api/submissions/:id</div>
          <div class="endpoint"><span class="method delete">DELETE</span> /api/submissions/:id</div>

          <h3 style="font-size: 14px; color: #667eea; margin-top: 20px; margin-bottom: 10px;">Enrollments</h3>
          <div class="endpoint"><span class="method get">GET</span> /api/enrollments</div>
          <div class="endpoint"><span class="method post">POST</span> /api/enrollments</div>
          <div class="endpoint"><span class="method delete">DELETE</span> /api/enrollments/:id</div>
        </div>

        <p style="margin-top: 30px; font-size: 12px; color: #999;">Built with Node.js • Express • Prisma • Supabase</p>
      </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/api/express/status', (_req, res) => {
  res.json({ status: 'ok', message: 'Express API is running', timestamp: new Date().toISOString() });
});

// Echo endpoint
app.post('/api/express/echo', (req, res) => {
  res.json({ payload: req.body, receivedAt: new Date().toISOString() });
});

// Student app routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Express API server listening on http://localhost:${port}`);
});
