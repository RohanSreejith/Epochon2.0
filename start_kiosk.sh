#!/bin/bash

# NYAYA-VAANI Kiosk Startup Script
# Usage: ./start_kiosk.sh

echo "🚀 Starting NYAYA-VAANI Kiosk..."

# 1. Disable Screen Blanking / Power Saving
xset s off
xset -dpms
xset s noblank

# 2. Hide Mouse Cursor (Optional, requires unclutter)
# unclutter -idle 0 &

# 3. Start Backend (in background)
cd /path/to/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# 4. Start Frontend (serve build)
# Assumes 'npm run build' was run
cd /path/to/frontend
npx serve -s dist -l 5173 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

# 5. Launch Browser in Kiosk Mode
# Chromium is preferred for kiosks
sleep 5 # Wait for services
chromium-browser --kiosk --no-first-run --incognito --disable-restore-session-state "http://localhost:5173"

# Cleanup on exit
kill $BACKEND_PID
kill $FRONTEND_PID
