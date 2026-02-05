import express from 'express';
import cors from 'cors';
import { port } from './config/oauth.js';
import googleRoutes from './routes/google.js';
import todoistRoutes from './routes/todoist.js';
import apiRoutes from './routes/api.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/google', googleRoutes);
app.use('/api/todoist', todoistRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
