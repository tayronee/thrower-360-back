#!/bin/bash

# Script simplificado para contornar o problema da subscription
set -e

echo "🔧 Setup Azure - Método Simplificado..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Usar a subscription que sabemos que funciona
SUBSCRIPTION_ID="2a5a9002-e8d8-4baf-8237-9ba03a4fb948"
echo -e "${YELLOW}Usando Subscription:${NC} $SUBSCRIPTION_ID"

# Registrar provedores necessários
echo -e "\n${YELLOW}1. Registrando provedores Azure...${NC}"
az provider register --namespace Microsoft.Storage --subscription "$SUBSCRIPTION_ID"
az provider register --namespace Microsoft.Resources --subscription "$SUBSCRIPTION_ID"
echo -e "${GREEN}✅ Provedores registrados${NC}"

# Aguardar alguns segundos
sleep 5

# Tentar com região diferente
LOCATION="East US"
RG_NAME="rg-terraform-state"
STORAGE_NAME="stthrower$(date +%s)"
CONTAINER_NAME="tfstate"

echo -e "\n${YELLOW}2. Criando Resource Group...${NC}"
az group create \
    --name "$RG_NAME" \
    --location "$LOCATION" \
    --subscription "$SUBSCRIPTION_ID"
echo -e "${GREEN}✅ Resource Group criado${NC}"

echo -e "\n${YELLOW}3. Criando Storage Account: $STORAGE_NAME...${NC}"
az storage account create \
    --name "$STORAGE_NAME" \
    --resource-group "$RG_NAME" \
    --location "$LOCATION" \
    --sku "Standard_LRS" \
    --subscription "$SUBSCRIPTION_ID" \
    --kind "StorageV2" \
    --access-tier "Hot"
echo -e "${GREEN}✅ Storage Account criado${NC}"

echo -e "\n${YELLOW}4. Criando Container...${NC}"
az storage container create \
    --name "$CONTAINER_NAME" \
    --account-name "$STORAGE_NAME" \
    --auth-mode login
echo -e "${GREEN}✅ Container criado${NC}"

echo -e "\n${YELLOW}5. Criando Service Principal...${NC}"
SP_NAME="sp-thrower-360-github"

# Deletar se existir
if az ad sp show --id "http://$SP_NAME" &> /dev/null; then
    az ad sp delete --id "http://$SP_NAME"
fi

SP_OUTPUT=$(az ad sp create-for-rbac \
    --name "$SP_NAME" \
    --role "Contributor" \
    --scopes "/subscriptions/$SUBSCRIPTION_ID" \
    --sdk-auth)
echo -e "${GREEN}✅ Service Principal criado${NC}"

echo -e "\n${YELLOW}6. Obtendo chave do Storage...${NC}"
STORAGE_KEY=$(az storage account keys list \
    --resource-group "$RG_NAME" \
    --account-name "$STORAGE_NAME" \
    --subscription "$SUBSCRIPTION_ID" \
    --query '[0].value' -o tsv)
echo -e "${GREEN}✅ Chave obtida${NC}"

# Atualizar backend.tf
echo -e "\n${YELLOW}7. Atualizando backend.tf...${NC}"
cat > backend.tf << EOF
# backend.tf - Configuração do backend remoto
terraform {
  backend "azurerm" {
    resource_group_name  = "$RG_NAME"
    storage_account_name = "$STORAGE_NAME"
    container_name       = "$CONTAINER_NAME"
    key                  = "thrower-360-back.tfstate"
  }
}
EOF
echo -e "${GREEN}✅ Backend atualizado${NC}"

# Extrair informações do SP
CLIENT_ID=$(echo "$SP_OUTPUT" | jq -r '.clientId')
CLIENT_SECRET=$(echo "$SP_OUTPUT" | jq -r '.clientSecret')
TENANT_ID=$(echo "$SP_OUTPUT" | jq -r '.tenantId')

# Mostrar resultados
echo -e "\n${GREEN}🎉 Configuração concluída com sucesso!${NC}"
echo -e "\n${YELLOW}📋 Configure estes secrets no GitHub:${NC}"
echo "================================================"

echo -e "\n${YELLOW}GitHub Repository → Settings → Secrets and variables → Actions${NC}"

echo -e "\n${YELLOW}AZURE_CREDENTIALS:${NC}"
echo "$SP_OUTPUT"

echo -e "\n${YELLOW}MONGODB_URI:${NC}"
echo "Sua string de conexão MongoDB aqui"

echo -e "\n${YELLOW}MONGODB_URI_PROD:${NC}"
echo "Sua string de conexão MongoDB de produção aqui"

echo -e "\n${YELLOW}Informações do backend (já configuradas):${NC}"
echo "Resource Group: $RG_NAME"
echo "Storage Account: $STORAGE_NAME"
echo "Container: $CONTAINER_NAME"

echo -e "\n${GREEN}✅ Agora você pode fazer push do código para o GitHub!${NC}"
echo -e "${YELLOW}O GitHub Actions usará esses recursos automaticamente.${NC}"
