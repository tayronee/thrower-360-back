#!/bin/bash

# Script para configurar recursos Azure para Terraform com GitHub Actions
# Execute este script após fazer login na Azure CLI (az login)

set -e  # Para parar o script se algum comando falhar

echo "🚀 Configurando recursos Azure para Terraform..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações (modifique conforme necessário)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SP_NAME="sp-thrower-360-github"
RG_NAME="rg-terraform-state"
STORAGE_ACCOUNT_NAME="stthrower360tf$(date +%s)"
CONTAINER_NAME="tfstate"
LOCATION="East US 2"

echo -e "${YELLOW}Subscription ID:${NC} $SUBSCRIPTION_ID"
echo -e "${YELLOW}Service Principal:${NC} $SP_NAME"
echo -e "${YELLOW}Resource Group:${NC} $RG_NAME"
echo -e "${YELLOW}Storage Account:${NC} $STORAGE_ACCOUNT_NAME"

# Verificar se já está logado
if ! az account show &> /dev/null; then
    echo -e "${RED}Erro: Você precisa fazer login na Azure CLI primeiro${NC}"
    echo "Execute: az login"
    exit 1
fi

# 1. Criar Resource Group
echo -e "\n${YELLOW}1. Criando Resource Group...${NC}"
if az group show --name "$RG_NAME" &> /dev/null; then
    echo -e "${GREEN}✅ Resource Group já existe${NC}"
else
    az group create --name "$RG_NAME" --location "$LOCATION"
    echo -e "${GREEN}✅ Resource Group criado${NC}"
fi

# 2. Criar Storage Account
echo -e "\n${YELLOW}2. Criando Storage Account...${NC}"
if az storage account show --name "$STORAGE_ACCOUNT_NAME" --resource-group "$RG_NAME" &> /dev/null; then
    echo -e "${GREEN}✅ Storage Account já existe${NC}"
else
    # Tentar com --subscription explícito
    az storage account create \
        --name "$STORAGE_ACCOUNT_NAME" \
        --resource-group "$RG_NAME" \
        --location "$LOCATION" \
        --sku "Standard_LRS" \
        --subscription "$SUBSCRIPTION_ID"
    echo -e "${GREEN}✅ Storage Account criado${NC}"
fi

# 3. Criar Container
echo -e "\n${YELLOW}3. Criando Container...${NC}"
az storage container create \
    --name "$CONTAINER_NAME" \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --subscription "$SUBSCRIPTION_ID" \
    --auth-mode login &> /dev/null || true
echo -e "${GREEN}✅ Container criado/verificado${NC}"

# 4. Criar Service Principal
echo -e "\n${YELLOW}4. Criando Service Principal...${NC}"
if az ad sp show --id "http://$SP_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Service Principal já existe. Deletando para recriar...${NC}"
    az ad sp delete --id "http://$SP_NAME"
fi

SP_OUTPUT=$(az ad sp create-for-rbac \
    --name "$SP_NAME" \
    --role "Contributor" \
    --scopes "/subscriptions/$SUBSCRIPTION_ID" \
    --sdk-auth)

echo -e "${GREEN}✅ Service Principal criado${NC}"

# 5. Obter chave do Storage Account
echo -e "\n${YELLOW}5. Obtendo chave do Storage Account...${NC}"
STORAGE_KEY=$(az storage account keys list \
    --resource-group "$RG_NAME" \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --subscription "$SUBSCRIPTION_ID" \
    --query '[0].value' -o tsv)

echo -e "${GREEN}✅ Chave obtida${NC}"

# 6. Exibir informações para configuração
echo -e "\n${GREEN}🎉 Configuração concluída!${NC}"
echo -e "\n${YELLOW}📋 Informações para configurar no GitHub:${NC}"
echo "================================================"

echo -e "\n${YELLOW}1. GitHub Secrets (Settings > Secrets and variables > Actions):${NC}"
echo "AZURE_CREDENTIALS:"
echo "$SP_OUTPUT"
echo ""
echo "ARM_ACCESS_KEY:"
echo "$STORAGE_KEY"
echo ""

# Extrair informações do Service Principal
CLIENT_ID=$(echo "$SP_OUTPUT" | jq -r '.clientId')
CLIENT_SECRET=$(echo "$SP_OUTPUT" | jq -r '.clientSecret')
TENANT_ID=$(echo "$SP_OUTPUT" | jq -r '.tenantId')

echo "AZURE_CLIENT_ID: $CLIENT_ID"
echo "AZURE_CLIENT_SECRET: $CLIENT_SECRET"
echo "AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo "AZURE_TENANT_ID: $TENANT_ID"

echo -e "\n${YELLOW}2. Configuração do backend.tf:${NC}"
echo "resource_group_name  = \"$RG_NAME\""
echo "storage_account_name = \"$STORAGE_ACCOUNT_NAME\""
echo "container_name       = \"$CONTAINER_NAME\""
echo "key                  = \"thrower-360-back.tfstate\""

# Atualizar o arquivo backend.tf com o nome correto do storage account
cat > terraform/backend.tf << EOF
# backend.tf - Configuração do backend remoto
terraform {
  backend "azurerm" {
    resource_group_name  = "$RG_NAME"
    storage_account_name = "$STORAGE_ACCOUNT_NAME"
    container_name       = "$CONTAINER_NAME"
    key                  = "thrower-360-back.tfstate"
  }
}
EOF

echo -e "${GREEN}✅ Arquivo backend.tf atualizado automaticamente${NC}"

echo -e "\n${YELLOW}3. Para testar localmente:${NC}"
echo "export ARM_CLIENT_ID=\"$CLIENT_ID\""
echo "export ARM_CLIENT_SECRET=\"$CLIENT_SECRET\""
echo "export ARM_SUBSCRIPTION_ID=\"$SUBSCRIPTION_ID\""
echo "export ARM_TENANT_ID=\"$TENANT_ID\""
echo "export ARM_ACCESS_KEY=\"$STORAGE_KEY\""

echo -e "\n${GREEN}✅ Setup completo! Agora configure os secrets no GitHub e faça o push do código.${NC}"
