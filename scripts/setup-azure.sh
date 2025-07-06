#!/bin/bash
# Script para configurar o Azure para GitHub Actions e Terraform

set -e

# Variáveis
SUBSCRIPTION_ID="your-subscription-id"
RESOURCE_GROUP_NAME="rg-terraform-state"
STORAGE_ACCOUNT_NAME="stthrower360terraform"
CONTAINER_NAME="tfstate"
SERVICE_PRINCIPAL_NAME="sp-thrower-360-github-actions"

echo "🚀 Configurando Azure para GitHub Actions e Terraform..."

# 1. Criar resource group para o estado do Terraform
echo "📦 Criando Resource Group para estado do Terraform..."
az group create \
  --name $RESOURCE_GROUP_NAME \
  --location "East US 2"

# 2. Criar storage account para o estado do Terraform
echo "💾 Criando Storage Account para estado do Terraform..."
az storage account create \
  --name $STORAGE_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --location "East US 2" \
  --sku Standard_LRS \
  --encryption-services blob

# 3. Criar container para o estado
echo "📁 Criando container para o estado..."
az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_ACCOUNT_NAME

# 4. Criar Service Principal para GitHub Actions
echo "🔐 Criando Service Principal para GitHub Actions..."
SP_OUTPUT=$(az ad sp create-for-rbac \
  --name $SERVICE_PRINCIPAL_NAME \
  --role Contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID \
  --sdk-auth)

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "🔑 Adicione os seguintes secrets no seu repositório GitHub:"
echo ""
echo "AZURE_CREDENTIALS:"
echo "$SP_OUTPUT"
echo ""
echo "📝 Também adicione estes secrets individuais:"
echo "MONGODB_URI: sua-string-de-conexao-mongodb-dev"
echo "MONGODB_URI_PROD: sua-string-de-conexao-mongodb-prod"
echo ""
echo "🏗️ Atualize o backend.tf com suas informações:"
echo "- subscription_id: $SUBSCRIPTION_ID"
echo "- resource_group_name: $RESOURCE_GROUP_NAME"
echo "- storage_account_name: $STORAGE_ACCOUNT_NAME"
echo ""
echo "Para obter seu subscription_id, execute: az account show --query id -o tsv"
