# Dev Environment Playbook

Quick reference to get up and running fast.

## Start Development Servers

### Terminal 1 - Backend
```bash
cd ~/Desktop/calendar-app/server
npm run dev
```

**Expected output:**
```
Google OAuth Config loaded:
  Client ID: 534441460414-4ae7k59...
  Client Secret: GOCSPX-abc...
  Redirect URI: http://localhost:3001/api/google/callback
Server running on http://localhost:3001
```

### Terminal 2 - Frontend
```bash
cd ~/Desktop/calendar-app/client
npm run dev
```

**Expected output:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

## Access App

Open browser: **http://localhost:3000**

## Quick Test

1. ✅ Green setup box = all connected
2. ✅ Drag task from inbox → calendar (creates purple block)
3. ✅ Drag purple block → different time (reschedules)
4. ✅ Drag purple block → inbox (unschedules)

## Common Issues & Fixes

### "Cannot GET /" on port 3001
✅ **This is normal!** Backend has no frontend. Use port **3000** instead.

### "Access blocked" or "invalid_client"
```bash
# Check .env has correct values
cat ~/Desktop/calendar-app/server/.env

# Client Secret MUST start with GOCSPX-
# If not, fix it then restart backend (Ctrl+C then npm run dev)
```

### Tasks not loading
```bash
# Verify Todoist token is set
grep TODOIST_API_TOKEN ~/Desktop/calendar-app/server/.env

# Should show: TODOIST_API_TOKEN=your_token_here
# If missing, add it then restart backend
```

### Calendar events not loading
- Check setup box - click "Connect" for Google
- Make sure at least one Google account is connected

### Made changes to .env
```bash
# .env changes require manual restart
# In backend terminal: Ctrl+C
npm run dev
```

## Stop Servers

```bash
# In each terminal window
Ctrl+C
```

## Quick Commands Reference

```bash
# Check if servers are running
lsof -ti:3001  # Backend (should return a process ID)
lsof -ti:3000  # Frontend (should return a process ID)

# Kill stuck servers if needed
kill -9 $(lsof -ti:3001)  # Kill backend
kill -9 $(lsof -ti:3000)  # Kill frontend

# View backend logs (in server directory)
npm run dev

# Verify .env config
cat server/.env

# Check Google Calendar connection status
curl http://localhost:3001/api/google/accounts

# Check Todoist connection status
curl http://localhost:3001/api/todoist/status

# Health check
curl http://localhost:3001/health
```

## File Locations Quick Reference

```bash
# Backend config
~/Desktop/calendar-app/server/.env

# Backend code
~/Desktop/calendar-app/server/src/

# Frontend code
~/Desktop/calendar-app/client/src/

# Stored tokens (Google OAuth)
~/Desktop/calendar-app/server/tokens.json
```

## One-Line Startup (Both Servers)

### Option 1: Manual (Recommended)
Open two terminal windows and run the commands above.

### Option 2: Using tmux (Advanced)
```bash
# Install tmux if not installed
brew install tmux

# Start both servers in split terminal
cd ~/Desktop/calendar-app
tmux new-session \; \
  send-keys 'cd server && npm run dev' C-m \; \
  split-window -h \; \
  send-keys 'cd client && npm run dev' C-m \;

# To exit tmux: Ctrl+B then type :kill-session
```

### Option 3: Background processes (Not Recommended)
```bash
cd ~/Desktop/calendar-app
cd server && npm run dev &
cd client && npm run dev &

# To stop:
pkill -f "node.*server.js"
pkill -f "vite"
```

## Troubleshooting Checklist

If something's broken:

- [ ] Both servers running? Check terminals
- [ ] Backend shows correct config on startup?
- [ ] Can access http://localhost:3000?
- [ ] Setup box green or yellow?
- [ ] Check browser console (F12) for errors
- [ ] Check backend terminal for errors
- [ ] Try hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

## Development Tips

**Hot Reload:**
- Frontend: Auto-reloads on file changes (Vite HMR)
- Backend: Auto-reloads on file changes (Node --watch)
- .env changes: Manual restart required

**Debug Mode:**
```bash
# Backend verbose logging
DEBUG=* npm run dev

# Check network calls in browser
F12 → Network tab
```

**Quick Reset:**
```bash
# Clear Google Calendar connections
rm ~/Desktop/calendar-app/server/tokens.json

# Reinstall dependencies if needed
cd server && rm -rf node_modules && npm install
cd client && rm -rf node_modules && npm install
```

---

**Need more help?** See:
- QUICKSTART.md - Detailed setup guide
- CONTEXT.md - Full project context
- README.md - Complete documentation
