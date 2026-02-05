# Project Structure

## Overview
This is a full-stack calendar application with React frontend and Express backend.

## Directory Structure

```
calendar-app/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar.jsx         # Main calendar component (switches between desktop/mobile views)
│   │   │   ├── Calendar.css
│   │   │   ├── MobileWeekView.jsx   # Custom mobile horizontal week view
│   │   │   ├── MobileWeekView.css
│   │   │   ├── TaskPanel.jsx        # Todoist tasks sidebar with filters
│   │   │   ├── TaskPanel.css
│   │   │   ├── SetupGuide.jsx       # Account connection UI
│   │   │   └── SetupGuide.css
│   │   ├── hooks/
│   │   │   ├── useCalendarEvents.js # Hook for fetching Google Calendar events
│   │   │   └── useTodoistTasks.js   # Hook for fetching/updating Todoist tasks
│   │   ├── App.jsx                  # Main app component
│   │   ├── App.css
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── oauth.js            # OAuth configuration for Google & Todoist
│   │   ├── routes/
│   │   │   ├── api.js              # Main API routes (events, tasks, scheduling)
│   │   │   ├── google.js           # Google OAuth routes
│   │   │   └── todoist.js          # Todoist OAuth routes
│   │   ├── services/
│   │   │   ├── googleCalendar.js   # Google Calendar API integration
│   │   │   ├── todoistService.js   # Todoist API integration
│   │   │   └── tokenStore.js       # Token persistence (file-based)
│   │   └── server.js               # Express server entry point
│   ├── .env.example                # Environment variables template
│   └── package.json
│
├── .gitignore
├── README.md                        # Full documentation
├── QUICKSTART.md                    # Quick setup guide
└── PROJECT_STRUCTURE.md             # This file
```

## Key Features by File

### Frontend Components

**Calendar.jsx**
- Responsive calendar that detects screen size
- Uses FullCalendar on desktop (week/day/month views)
- Uses custom MobileWeekView on mobile (≤768px)
- Handles drag-and-drop scheduling

**MobileWeekView.jsx**
- Custom horizontal week view for mobile
- Shows 7 rows (one per day)
- Easy touch-friendly navigation
- Supports drag-and-drop from task panel

**TaskPanel.jsx**
- Displays Todoist tasks in sidebar
- Client-side filtering with toggles:
  - Show/hide all-day tasks
  - Show/hide completed tasks
- Draggable tasks for time-blocking
- Priority color indicators

**SetupGuide.jsx**
- In-app account connection interface
- Shows connection status
- Allows adding multiple Google accounts
- Quick connect/disconnect buttons

### Backend Services

**googleCalendar.js**
- OAuth 2.0 authentication
- Multi-account support
- Fetches events from all connected calendars
- Automatic token refresh

**todoistService.js**
- API token authentication (from .env)
- Fetch all tasks (filtering done on client)
- Update task due dates/times
- Schedule tasks via drag-and-drop

**tokenStore.js**
- File-based token persistence
- Stores Google OAuth tokens by account ID
- Auto-creates tokens.json
- Note: Todoist uses API token from .env (not stored here)

## Data Flow

### Loading Events
1. Frontend calls `/api/calendar/events?startDate=X&endDate=Y`
2. Backend fetches from all connected Google accounts
3. Events merged and returned with account info
4. Frontend displays in calendar view

### Loading Tasks
1. Frontend calls `/api/todoist/tasks`
2. Backend returns all tasks (no filtering)
3. Frontend applies client-side filters based on toggle states
4. Tasks displayed in sidebar

### Scheduling Tasks (Drag & Drop)
1. User drags task from sidebar to calendar
2. Frontend calls `/api/todoist/tasks/:id/schedule` with new datetime
3. Backend updates task in Todoist
4. Frontend refetches tasks and events to show update

### Account Connection
1. User clicks "Connect" button
2. Popup opens to OAuth provider
3. User authenticates and grants permissions
4. Callback saves tokens to tokenStore
5. Popup closes, app refetches data

## Mobile Responsiveness

**Breakpoint: 768px**

### Desktop (>768px)
- Task panel on left (320px width)
- FullCalendar on right (flex: 1)
- Traditional vertical week/day/month views
- FullCalendar drag-and-drop

### Mobile (≤768px)
- Task panel on top (40vh max height)
- Calendar below (remaining space)
- Horizontal week view (7 rows)
- Native HTML5 drag-and-drop

## API Endpoints

### Calendar
- `GET /api/calendar/events?startDate=<ISO>&endDate=<ISO>`

### Tasks
- `GET /api/todoist/tasks`
- `POST /api/todoist/tasks/:id/schedule`

### Google OAuth
- `GET /api/google/auth`
- `GET /api/google/callback`
- `GET /api/google/accounts`
- `DELETE /api/google/accounts/:accountId`

### Todoist
- `GET /api/todoist/status` - Check if API token is configured

## Tech Stack

### Frontend
- React 18
- Vite (build tool)
- FullCalendar (desktop calendar)
- Axios (HTTP client)

### Backend
- Node.js (ES modules)
- Express
- Google APIs (googleapis npm package)
- Axios (Todoist API)

## Configuration

### Environment Variables
All in `server/.env`:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `TODOIST_API_TOKEN` (get from Todoist Settings → Integrations → Developer)
- `PORT` (default: 3001)

### Vite Proxy
Frontend proxies `/api/*` requests to `http://localhost:3001`

## Development Workflow

1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Open browser to `http://localhost:3000`
4. Connect accounts via SetupGuide component
5. Start viewing and scheduling!

## Future Enhancements

Potential additions:
- Multiple Todoist projects support
- Calendar color customization
- Task creation from calendar
- Recurring event support
- Desktop notifications
- Dark mode
- Export/sync functionality
