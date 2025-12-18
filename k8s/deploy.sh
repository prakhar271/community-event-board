#!/bin/bash

# Community Event Board Kubernetes Deployment Script

set -e

echo "🚀 Deploying Community Event Board to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"

# Create namespace and basic resources
echo "📦 Creating namespace and configuration..."
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml

# Deploy databases first
echo "🗄️ Deploying databases..."
kubectl apply -f postgres-deployment.yaml
kubectl apply -f redis-deployment.yaml

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n community-events
kubectl wait --for=condition=available --timeout=300s deployment/redis -n community-events

# Deploy API
echo "🔧 Deploying API..."
kubectl apply -f api-deployment.yaml

# Wait for API to be ready
echo "⏳ Waiting for API to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/community-events-api -n community-events

# Deploy frontend
echo "🎨 Deploying frontend..."
kubectl apply -f frontend-deployment.yaml

# Deploy ingress
echo "🌐 Setting up ingress..."
kubectl apply -f ingress.yaml

# Deploy monitoring
echo "📊 Setting up monitoring..."
kubectl apply -f monitoring.yaml

echo "✅ Deployment complete!"
echo ""
echo "📋 Deployment Summary:"
echo "Namespace: community-events"
echo "Services deployed:"
echo "  - PostgreSQL database"
echo "  - Redis cache"
echo "  - Community Events API (with auto-scaling)"
echo "  - Frontend (React app)"
echo "  - Ingress controller"
echo "  - Monitoring setup"
echo ""
echo "🔍 Check deployment status:"
echo "kubectl get all -n community-events"
echo ""
echo "📊 View logs:"
echo "kubectl logs -f deployment/community-events-api -n community-events"
echo ""
echo "🌐 Access your application:"
echo "Frontend: https://community-events.yourdomain.com"
echo "API: https://api.community-events.yourdomain.com"