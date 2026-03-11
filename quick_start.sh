#!/bin/bash

# Quick Start Script for Fake News Detector Backend
# This script sets up the complete development environment

set -e  # Exit on error

echo "🚀 Fake News Detector - Quick Start Setup"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi
echo ""

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data/raw data/processed models/baseline
echo "✅ Directories created"
echo ""

# Check if model exists
if [ ! -f "models/baseline/config.json" ]; then
    echo "⚠️  Warning: Model not found in models/baseline/"
    echo "   You need to train the model before using the API."
    echo "   Run: python src/fakey/models/train.py --epochs 1 --batch_size 8"
    echo ""
    read -p "Do you want to continue without the model? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📚 Access Points:"
echo "   - API Documentation: http://localhost:8000/docs"
echo "   - API Health Check:  http://localhost:8000/health"
echo "   - pgAdmin:          http://localhost:5050"
echo "     (Email: admin@fakenews.com, Password: admin)"
echo ""
echo "📋 Useful Commands:"
echo "   - View logs:        docker-compose logs -f backend"
echo "   - Stop services:    docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - Shell access:     docker-compose exec backend bash"
echo ""
echo "🔧 Next Steps:"
if [ ! -f "models/baseline/config.json" ]; then
    echo "   1. Train the model:"
    echo "      docker-compose exec backend python src/fakey/models/train.py --epochs 1 --batch_size 8"
    echo ""
fi
echo "   2. Test the API:"
echo "      curl -X POST http://localhost:8000/analyze \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"text\": \"Test news article...\"}'"
echo ""
echo "   3. View API docs: http://localhost:8000/docs"
echo ""
echo "Happy coding! 🎉"
