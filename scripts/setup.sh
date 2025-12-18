#!/bin/bash

# Community Event Board Setup Script
echo "🚀 Setting up Community Event Board..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing server dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd src/client
npm install
cd ../..

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration before starting the application"
else
    echo "✅ Environment file already exists"
fi

# Create uploads directory
mkdir -p uploads
echo "📁 Created uploads directory"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database and service configurations"
echo "2. Start PostgreSQL and Redis services"
echo "3. Run 'npm run dev' to start the development servers"
echo ""
echo "For production deployment, see DEPLOYMENT.md"