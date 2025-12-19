#!/bin/bash

# Redis Setup Script for Community Event Board
echo "🔧 Setting up Redis for Community Event Board..."

# Check if Redis is already installed
if command -v redis-server &> /dev/null; then
    echo "✅ Redis is already installed"
    redis-server --version
else
    echo "📦 Installing Redis..."
    
    # Detect OS and install Redis
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install redis
        else
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian
            sudo apt-get update
            sudo apt-get install -y redis-server
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            sudo yum install -y redis
        elif command -v dnf &> /dev/null; then
            # Fedora
            sudo dnf install -y redis
        else
            echo "❌ Unsupported Linux distribution"
            exit 1
        fi
    else
        echo "❌ Unsupported operating system: $OSTYPE"
        echo "Please install Redis manually: https://redis.io/download"
        exit 1
    fi
fi

# Start Redis service
echo "🚀 Starting Redis service..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS with Homebrew
    brew services start redis
    echo "✅ Redis started with Homebrew services"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v systemctl &> /dev/null; then
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
        echo "✅ Redis started with systemctl"
    else
        # Fallback to direct start
        redis-server --daemonize yes
        echo "✅ Redis started as daemon"
    fi
fi

# Test Redis connection
echo "🔍 Testing Redis connection..."
sleep 2

if redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is running and responding to ping"
    
    # Set a test key
    redis-cli set test_key "Community Event Board Redis Setup" > /dev/null
    test_value=$(redis-cli get test_key)
    
    if [[ "$test_value" == "Community Event Board Redis Setup" ]]; then
        echo "✅ Redis read/write test successful"
        redis-cli del test_key > /dev/null
    else
        echo "⚠️ Redis read/write test failed"
    fi
    
    # Show Redis info
    echo ""
    echo "📊 Redis Information:"
    echo "   Version: $(redis-cli info server | grep redis_version | cut -d: -f2 | tr -d '\r')"
    echo "   Port: 6379"
    echo "   Memory: $(redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')"
    echo ""
    echo "🎉 Redis setup complete!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Your .env file is already configured with REDIS_URL=redis://localhost:6379"
    echo "   2. Start your application with: npm run dev"
    echo "   3. Check logs for Redis connection confirmation"
    echo ""
    echo "🔧 Redis Management Commands:"
    echo "   - Check status: redis-cli ping"
    echo "   - Monitor commands: redis-cli monitor"
    echo "   - View all keys: redis-cli keys '*'"
    echo "   - Clear all data: redis-cli flushall"
    
else
    echo "❌ Redis is not responding. Please check the installation."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   - Check if Redis is running: ps aux | grep redis"
    echo "   - Try starting manually: redis-server"
    echo "   - Check logs: tail -f /var/log/redis/redis-server.log"
    exit 1
fi