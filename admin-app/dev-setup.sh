#!/bin/bash

# Health Blog Admin - Development Setup Script

echo "🚀 Setting up Health Blog Admin Development Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success ".env file created from .env.example"
        print_warning "Please update the database credentials in .env file if needed"
    else
        print_error ".env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Start PostgreSQL and pgAdmin with Docker Compose
print_status "Starting PostgreSQL and pgAdmin containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is running
if docker-compose ps | grep -q "postgres.*Up"; then
    print_success "PostgreSQL is running"
else
    print_error "Failed to start PostgreSQL"
    exit 1
fi

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build the application
print_status "Building the application..."
npm run build

# Start the application in development mode
print_status "Starting the application in development mode..."
npm run start:dev &

# Wait for the application to start
sleep 5

# Run seed data
print_status "Creating seed data..."
npm run seed

print_success "🎉 Development environment is ready!"
print_status "📋 Services Information:"
echo "  • API Server: http://localhost:3000/api"
echo "  • pgAdmin: http://localhost:8080"
echo "    - Email: admin@healthblog.com"
echo "    - Password: admin123"
echo "  • PostgreSQL: localhost:5432"
echo "    - Database: health_blog_admin"
echo "    - Username: postgres"
echo "    - Password: password"

print_status "🔑 Default Admin Account:"
echo "  • Email: admin@healthblog.com"
echo "  • Password: admin123"

print_status "📖 API Documentation:"
echo "  • Base URL: http://localhost:3000/api"
echo "  • Login: POST /api/auth/login"
echo "  • Blog Posts: GET /api/blog-posts"
echo "  • Categories: GET /api/categories"
echo "  • Tags: GET /api/tags"

print_status "🛑 To stop the development environment:"
echo "  • Stop API: Ctrl+C"
echo "  • Stop Docker containers: docker-compose down"

# Keep the script running to show logs
wait
