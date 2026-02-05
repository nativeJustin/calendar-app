# Quick Start Guide

Get your calendar app running in 5 minutes!

## Step 1: Install Dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd client
npm install
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Get your API credentials:

   **Google Calendar:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URI: `http://localhost:3001/api/google/callback`
   - Copy Client ID and Client Secret

   **Todoist:**
   - Go to [Todoist Settings → Integrations → Developer](https://todoist.com/app/settings/integrations/developer)
   - Scroll down to the "API token" section
   - Copy your API token

3. Update your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/google/callback

   TODOIST_API_TOKEN=your_todoist_api_token_here

   PORT=3001
   ```

## Step 3: Start the Servers

### Terminal 1 - Backend
```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```

The app will open on `http://localhost:3000`

## Step 4: Connect Your Accounts

1. Open `http://localhost:3000` in your browser
2. You'll see a yellow setup box at the top
3. Click "Connect" next to Google Calendar
   - A popup will open for Google authentication
   - Sign in and grant permissions
   - You can add multiple Google accounts by clicking "Add Another"
4. Todoist should show as "Connected" if you added your API token to `.env`
   - If not, make sure `TODOIST_API_TOKEN` is set in `server/.env`
   - Restart the backend server after adding the token

Once Google Calendar is connected and Todoist API token is configured, the setup box will turn green!

## Step 5: Start Using the App

### On Desktop:
- View your calendar in Week, Day, or Month view
- See your Todoist tasks in the left sidebar
- Drag tasks from the sidebar to the calendar to schedule them
- Use the toggles to show/hide all-day tasks and completed tasks

### On Mobile:
- The week view automatically switches to horizontal rows
- Each day is shown as a separate row for easy scrolling
- Tap and drag tasks to any day to schedule them

## Troubleshooting

**"No events showing"**
- Make sure you've connected at least one Google account
- Check that your calendar has events in the current time period
- Try refreshing the page

**"No tasks showing"**
- Make sure you've connected your Todoist account
- Check that you have active tasks in Todoist
- Try toggling the "Show completed" filter

**"Drag and drop not working"**
- Make sure JavaScript is enabled
- Try refreshing the page
- Check browser console (F12) for errors

**"Can't connect accounts"**
- Verify your API credentials in `.env`
- Make sure both backend and frontend servers are running
- Check that redirect URIs match exactly in your API console and `.env`

## Next Steps

- Add more Google Calendar accounts to see all your calendars in one place
- Create tasks in Todoist and drag them to your calendar
- Try the mobile view by resizing your browser window

Enjoy your new master calendar! 🎉
