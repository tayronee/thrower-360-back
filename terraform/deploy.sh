#!/bin/bash

# Script para build e deploy da aplicação
set -e

echo "🚀 Iniciando processo de build e deploy..."

# Variáveis
RESOURCE_GROUP_NAME=$(terraform output -raw resource_group_name)
REGISTRY_LOGIN_SERVER=$(terraform output -raw container_registry_login_server)
REGISTRY_USERNAME=$(terraform output -raw container_registry_admin_username)
REGISTRY_PASSWORD=$(terraform output -raw container_registry_admin_password)
CONTAINER_APP_NAME=$(terraform output -raw container_app_name)
IMAGE_NAME="thrower-360-back"
IMAGE_TAG="latest"

echo "📦 Fazendo build da imagem Docker..."
docker build -t $IMAGE_NAME:$IMAGE_TAG ..

echo "🏷️  Taggeando imagem para o Azure Container Registry..."
docker tag $IMAGE_NAME:$IMAGE_TAG $REGISTRY_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG

echo "🔐 Fazendo login no Azure Container Registry..."
echo $REGISTRY_PASSWORD | docker login $REGISTRY_LOGIN_SERVER --username $REGISTRY_USERNAME --password-stdin

echo "⬆️  Enviando imagem para o Azure Container Registry..."
docker push $REGISTRY_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG

echo "🔄 Atualizando Container App..."
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --image $REGISTRY_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG

echo "✅ Deploy concluído com sucesso!"
echo "🌐 URL da aplicação: $(terraform output -raw container_app_fqdn)"
