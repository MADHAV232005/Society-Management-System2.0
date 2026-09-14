#!/bin/bash
pkill -f "manage.py runserver 127.0.0.1:8001" || true
sleep 1
python3 manage.py runserver 127.0.0.1:8001 &
DJANGO_PID=$!
trap "kill $DJANGO_PID 2>/dev/null || true" EXIT INT TERM
exec vite --host 0.0.0.0 --port 3000
