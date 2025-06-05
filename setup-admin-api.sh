#!/bin/bash

# Setup script for Diary Health Project with Admin API

echo "🚀 Setting up Diary Health Project with Admin API..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "admin-app" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Setting up Admin Backend (NestJS)..."
cd admin-app

# Install admin backend dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing admin backend dependencies..."
    npm install
else
    print_status "Admin backend dependencies already installed"
fi

# Setup admin environment file
if [ ! -f ".env" ]; then
    print_status "Creating admin backend .env file..."
    cp .env.example .env 2>/dev/null || echo "
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=health_blog

# JWT
JWT_SECRET=health-blog-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3001

# Server
PORT=3000
" > .env
    print_warning "Please update admin-app/.env with your database credentials"
else
    print_status "Admin backend .env file already exists"
fi

# Start PostgreSQL with Docker (if not running)
print_status "Checking PostgreSQL database..."
if ! docker ps | grep -q postgres; then
    print_status "Starting PostgreSQL with Docker..."
    docker-compose up -d postgres
    sleep 5
else
    print_status "PostgreSQL is already running"
fi

# Go back to project root
cd ..

print_status "Setting up Frontend (Next.js)..."
cd frontend

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
else
    print_status "Frontend dependencies already installed"
fi

# Setup frontend environment file
if [ ! -f ".env.local" ]; then
    print_status "Creating frontend .env.local file..."
    echo "
# Admin Backend Configuration
ADMIN_API_URL=http://localhost:3000/api

# Next.js API Configuration  
NEXT_PUBLIC_API_URL=

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3001

# Supabase Configuration (if using)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
" > .env.local
    print_warning "Please update frontend/.env.local with your configuration"
else
    print_status "Frontend .env.local file already exists"
fi

cd ..

print_status "Setup completed! 🎉"
echo ""
print_status "Next steps:"
echo "1. Update environment files:"
echo "   - admin-app/.env (database credentials)"
echo "   - frontend/.env.local (API URLs and secrets)"
echo ""
echo "2. Start the admin backend:"
echo "   cd admin-app && npm run start:dev"
echo ""
echo "3. Start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Or start both together:"
echo "   cd frontend && npm run dev:with-admin"
echo ""
print_status "URLs:"
echo "   - Frontend: http://localhost:3001"
echo "   - Admin API: http://localhost:3000/api"
echo "   - Database: localhost:5432"
echo ""
print_warning "Make sure to seed the admin database with initial data:"
echo "   cd admin-app && npm run seed"
