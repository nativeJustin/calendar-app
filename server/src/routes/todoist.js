import express from 'express';
import todoistService from '../services/todoistService.js';

const router = express.Router();

// Check connection status
router.get('/status', async (_req, res) => {
  try {
    const configured = todoistService.isConfigured();
    res.json({ connected: configured });
  } catch (error) {
    console.error('Error checking Todoist status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

export default router;
