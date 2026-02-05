import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import googleCalendarService from '../services/googleCalendar.js';
import tokenStore from '../services/tokenStore.js';

const router = express.Router();

// Store state for OAuth flow (in production, use Redis or database)
const authStates = new Map();

// Initiate OAuth flow
router.get('/auth', async (req, res) => {
  try {
    const state = uuidv4();
    authStates.set(state, { timestamp: Date.now() });

    // Clean up old states (older than 10 minutes)
    for (const [key, value] of authStates.entries()) {
      if (Date.now() - value.timestamp > 10 * 60 * 1000) {
        authStates.delete(key);
      }
    }

    const authUrl = await googleCalendarService.getAuthUrl(state);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    res.status(500).json({ error: 'Failed to initiate authentication' });
  }
});

// OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send('Missing code or state parameter');
  }

  if (!authStates.has(state)) {
    return res.status(400).send('Invalid state parameter');
  }

  authStates.delete(state);

  try {
    console.log('Starting OAuth callback with code:', code.substring(0, 20) + '...');

    // Exchange code for tokens
    console.log('Exchanging code for tokens...');
    const tokens = await googleCalendarService.getTokensFromCode(code);
    console.log('Tokens received:', tokens ? 'Success' : 'Failed');

    // Get user email
    console.log('Getting user email...');
    const email = await googleCalendarService.getUserEmail(tokens);
    console.log('User email:', email);

    // Generate unique account ID
    const accountId = uuidv4();
    console.log('Generated account ID:', accountId);

    // Store tokens
    console.log('Saving tokens...');
    await tokenStore.saveGoogleTokens(accountId, tokens, email);
    console.log('Tokens saved successfully');

    // Redirect back to frontend with success
    res.send(`
      <html>
        <body>
          <h2>Google Calendar Connected Successfully!</h2>
          <p>Account: ${email}</p>
          <p>You can close this window and return to the app.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    res.status(500).send(`
      <html>
        <body>
          <h2>Authentication Failed</h2>
          <p>Error: ${error.message}</p>
          <p>Check the server terminal for more details.</p>
          <p>You can close this window and try again.</p>
        </body>
      </html>
    `);
  }
});

// List connected accounts
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await tokenStore.getAllGoogleAccounts();
    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching Google accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Remove account
router.delete('/accounts/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    await tokenStore.removeGoogleAccount(accountId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing Google account:', error);
    res.status(500).json({ error: 'Failed to remove account' });
  }
});

export default router;
