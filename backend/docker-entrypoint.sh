#!/bin/sh
set -e

# Ensure db directory exists
mkdir -p /app/db

# Initialize/upgrade database
echo "Running database migrations..."
flask db upgrade 2>/dev/null || (flask db init && flask db migrate -m "init" && flask db upgrade)

# Seed data if database is empty
echo "Checking seed data..."
python -c "
from app import create_app
from app.extensions import db
from app.models import User
app = create_app()
with app.app_context():
    if User.query.count() == 0:
        print('Seeding database...')
        from app.seeds.seed_data import run_seed
        run_seed()
    else:
        print('Database already seeded.')
"

echo "Starting Flask server..."
exec python run.py
