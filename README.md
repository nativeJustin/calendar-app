# Master Calendar App

A mobile-responsive web app that integrates multiple Google Calendars with Todoist tasks, featuring drag-and-drop time blocking.

## Features

- **Multi-Calendar Support**: Connect and view multiple Google Calendar accounts
- **Todoist Integration**: View and manage your Todoist tasks
- **Drag-and-Drop Time Blocking**: Drag tasks from the sidebar directly to your calendar to schedule them
- **Task Filtering**: Toggle visibility of all-day tasks and completed tasks
- **Mobile Responsive**:
  - Desktop: Traditional week/day/month calendar views
  - Mobile: Horizontal week view with 7 rows (one per day) for better touch interaction
- **Real-time Updates**: Changes sync immediately with Google Calendar and Todoist

## Tech Stack

**Frontend:**
- React 18
- Vite
- FullCalendar
- Axios

**Backend:**
- Node.js
- Express
- Google Calendar API
- Todoist API

## Setup

### Prerequisites

- Node.js 18+
- Google Cloud Project with Calendar API enabled
- Todoist account and API credentials

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```
   PORT=3001

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3001/api/google/callback

   # Todoist API Token
   TODOIST_API_TOKEN=your_todoist_api_token
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Usage

### Connecting Accounts

1. **Google Calendar**: Click "Connect" in the setup guide or navigate to `/api/google/auth`
2. **Todoist**: Add your API token to the `.env` file (get it from Todoist Settings → Integrations → Developer)

### Time Blocking Tasks

1. Find a task in the left sidebar
2. Drag it to a time slot on the calendar
3. The task will be scheduled at that time in Todoist

### Filtering Tasks

Use the toggles in the task panel to:
- Show/hide all-day tasks
- Show/hide completed tasks

### Mobile View

On mobile devices (< 768px width), the week view automatically switches to a horizontal layout where each day is displayed as a row, making it easier to scroll through your week.

## API Endpoints

### Calendar Events
- `GET /api/calendar/events?startDate=<ISO>&endDate=<ISO>` - Get events from all connected Google accounts

### Todoist Tasks
- `GET /api/todoist/tasks` - Get all Todoist tasks
- `POST /api/todoist/tasks/:id/schedule` - Schedule a task
  ```json
  {
    "datetime": "2024-01-15T14:00:00Z"
  }
  ```

### Authentication
- `GET /api/google/auth` - Initiate Google OAuth flow
- `GET /api/google/callback` - Google OAuth callback
- `GET /api/todoist/status` - Check if Todoist API token is configured

## Development

### Project Structure

```
calendar-app/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── server/              # Express backend
    ├── src/
    │   ├── config/      # Configuration files
    │   ├── routes/      # API routes
    │   ├── services/    # Business logic
    │   └── server.js    # Server entry point
    └── package.json
```

### Adding More Calendar Accounts

To add another Google account:
1. Visit `/api/google/auth` while logged into the desired Google account
2. Grant permissions
3. The calendar will automatically include events from this account

## Troubleshooting

### Tasks not loading
- Verify Todoist authentication at `/api/todoist/auth`
- Check browser console for API errors

### Calendar events not showing
- Verify Google authentication at `/api/google/auth`
- Ensure date range is correct
- Check that calendars have events in the selected time period

### Drag and drop not working
- Ensure JavaScript is enabled
- Try refreshing the page
- Check browser console for errors

## License

ISC
