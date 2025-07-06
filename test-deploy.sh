#!/bin/bash

set -e

echo "🚀 Testing deployment workflow locally..."

# Set environment
export ARM_CLIENT_ID="${AZURE_CLIENT_ID}"
export ARM_CLIENT_SECRET="${AZURE_CLIENT_SECRET}"
export ARM_SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID}"
export ARM_TENANT_ID="${AZURE_TENANT_ID}"
export ARM_ACCESS_KEY="${ARM_ACCESS_KEY}"

ENVIRONMENT="dev"
IMAGE_TAG="$(git rev-parse HEAD)"
MONGODB_URI="${MONGODB_URI}"

echo "📦 Environment: $ENVIRONMENT"
echo "🏷️  Image tag: $IMAGE_TAG"

# Step 1: Create infrastructure
echo "🏗️  Step 1: Creating base infrastructure..."
cd terraform/01-infrastructure

terraform init
terraform plan \
  -var="environment=$ENVIRONMENT" \
  -var="container_image_tag=$IMAGE_TAG" \
  -var="mongodb_uri=$MONGODB_URI" \
  -out=tfplan-infra

terraform apply -auto-approve tfplan-infra

echo "📋 Getting ACR details..."
ACR_LOGIN_SERVER=$(terraform output -raw container_registry_login_server)
ACR_USERNAME=$(terraform output -raw container_registry_admin_username)
ACR_PASSWORD=$(terraform output -raw container_registry_admin_password)

echo "🐳 ACR Login Server: $ACR_LOGIN_SERVER"

cd ../..

# Step 2: Build and push Docker image
echo "🐳 Step 2: Building and pushing Docker image..."
az acr login --name $(echo $ACR_LOGIN_SERVER | cut -d'.' -f1)

docker build -t $ACR_LOGIN_SERVER/thrower360:$IMAGE_TAG .
docker push $ACR_LOGIN_SERVER/thrower360:$IMAGE_TAG

echo "✅ Image pushed successfully!"

# Step 3: Create Container App
echo "🚀 Step 3: Creating Container App..."
cd terraform/02-container-app

terraform init
terraform plan \
  -var="environment=$ENVIRONMENT" \
  -var="container_image_tag=$IMAGE_TAG" \
  -var="mongodb_uri=$MONGODB_URI" \
  -out=tfplan-app

terraform apply -auto-approve tfplan-app

echo "🌐 Getting Container App URL..."
APP_URL=$(terraform output -raw container_app_url)
echo "✅ Container App deployed at: $APP_URL"

cd ../..

echo "🎉 Deployment completed successfully!"
echo "🔗 Application URL: $APP_URL"
