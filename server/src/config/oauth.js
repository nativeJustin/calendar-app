import dotenv from 'dotenv';

dotenv.config();

export const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
};

// Debug: Log config on startup (hide sensitive parts)
console.log('Google OAuth Config loaded:');
console.log('  Client ID:', googleConfig.clientId ? `${googleConfig.clientId.substring(0, 20)}...` : 'MISSING');
console.log('  Client Secret:', googleConfig.clientSecret ? `${googleConfig.clientSecret.substring(0, 10)}...` : 'MISSING');
console.log('  Redirect URI:', googleConfig.redirectUri || 'MISSING');

export const todoistConfig = {
  apiToken: process.env.TODOIST_API_TOKEN
};

export const port = process.env.PORT || 3001;
