#!/usr/bin/env bash
# Exit on error
set -o errexit

# Determine python command
if command -v python3 >/dev/null 2>&1; then
    PYTHON="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON="python"
else
    echo "Error: Python not found" >&2
    exit 1
fi

# Install Python dependencies
$PYTHON -m pip install -r requirements.txt

# Collect static files for WhiteNoise
$PYTHON manage.py collectstatic --no-input

# Apply database migrations
$PYTHON manage.py migrate
