#!/bin/bash
set -e

echo "Setting up Holicruit..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  # Generate a random secret
  RANDOM_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "dev-secret-$(date +%s)")
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/change-me-to-a-random-secret/$RANDOM_SECRET/" .env
  else
    sed -i "s/change-me-to-a-random-secret/$RANDOM_SECRET/" .env
  fi
  echo "Created .env file with generated secret"
else
  echo ".env already exists, skipping"
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed database
echo "Seeding database with demo data..."
npx tsx prisma/seed.ts

echo ""
echo "Setup complete! Run 'npm run dev' to start the development server."
echo ""
echo "Demo accounts (all passwords: 'password123'):"
echo "  Hiring Manager: sarah@acme.com"
echo "  Candidate:      (check prisma/seed.ts for candidate emails)"
echo "  Headhunter:     alex@headhunt.com"
