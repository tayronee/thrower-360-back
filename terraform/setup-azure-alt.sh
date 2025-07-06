#!/bin/bash

# Script alternativo para configurar Azure - método manual passo a passo
set -e

echo "🔧 Configuração Azure - Método alternativo..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar login
if ! az account show &> /dev/null; then
    echo -e "${RED}Erro: Faça login primeiro: az login${NC}"
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${YELLOW}Usando Subscription:${NC} $SUBSCRIPTION_ID"

# Força atualizar o contexto da subscription
echo -e "\n${YELLOW}1. Atualizando contexto da subscription...${NC}"
az account set --subscription "$SUBSCRIPTION_ID"
az account show --query name -o tsv
echo -e "${GREEN}✅ Contexto atualizado${NC}"

# Criar Resource Group em região diferente (pode ser problema de região)
RG_NAME="rg-terraform-state"
LOCATION="Brazil South"  # Mudando para Brasil
echo -e "\n${YELLOW}2. Criando Resource Group em $LOCATION...${NC}"

if az group show --name "$RG_NAME" --subscription "$SUBSCRIPTION_ID" &> /dev/null; then
    echo -e "${GREEN}✅ Resource Group já existe${NC}"
else
    az group create \
        --name "$RG_NAME" \
        --location "$LOCATION" \
        --subscription "$SUBSCRIPTION_ID"
    echo -e "${GREEN}✅ Resource Group criado${NC}"
fi

# Criar Storage Account com nome mais simples
TIMESTAMP=$(date +%s)
STORAGE_NAME="stthrower$TIMESTAMP"
echo -e "\n${YELLOW}3. Criando Storage Account: $STORAGE_NAME...${NC}"

# Aguardar um pouco para propagação
sleep 3

az storage account create \
    --name "$STORAGE_NAME" \
    --resource-group "$RG_NAME" \
    --location "$LOCATION" \
    --sku "Standard_LRS" \
    --subscription "$SUBSCRIPTION_ID" \
    --allow-blob-public-access false

echo -e "${GREEN}✅ Storage Account criado${NC}"

# Criar container
CONTAINER_NAME="tfstate"
echo -e "\n${YELLOW}4. Criando container...${NC}"

az storage container create \
    --name "$CONTAINER_NAME" \
    --account-name "$STORAGE_NAME" \
    --subscription "$SUBSCRIPTION_ID" \
    --auth-mode login

echo -e "${GREEN}✅ Container criado${NC}"

# Criar Service Principal
SP_NAME="sp-thrower-360-github"
echo -e "\n${YELLOW}5. Criando Service Principal...${NC}"

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

# Obter chave do storage
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

# Mostrar resultados
echo -e "\n${GREEN}🎉 Configuração concluída!${NC}"
echo -e "\n${YELLOW}📋 GitHub Secrets para configurar:${NC}"
echo "================================================"

echo -e "\n${YELLOW}AZURE_CREDENTIALS:${NC}"
echo "$SP_OUTPUT"

echo -e "\n${YELLOW}ARM_ACCESS_KEY:${NC}"
echo "$STORAGE_KEY"

# Extrair informações
CLIENT_ID=$(echo "$SP_OUTPUT" | jq -r '.clientId')
CLIENT_SECRET=$(echo "$SP_OUTPUT" | jq -r '.clientSecret')
TENANT_ID=$(echo "$SP_OUTPUT" | jq -r '.tenantId')

echo -e "\n${YELLOW}Informações extras:${NC}"
echo "AZURE_CLIENT_ID: $CLIENT_ID"
echo "AZURE_CLIENT_SECRET: $CLIENT_SECRET"
echo "AZURE_SUBSCRIPTION_ID: $SUBSCRIPTION_ID"
echo "AZURE_TENANT_ID: $TENANT_ID"

echo -e "\n${YELLOW}Para testar localmente:${NC}"
echo "export ARM_CLIENT_ID=\"$CLIENT_ID\""
echo "export ARM_CLIENT_SECRET=\"$CLIENT_SECRET\""
echo "export ARM_SUBSCRIPTION_ID=\"$SUBSCRIPTION_ID\""
echo "export ARM_TENANT_ID=\"$TENANT_ID\""
echo "export ARM_ACCESS_KEY=\"$STORAGE_KEY\""

echo -e "\n${GREEN}✅ Agora configure os secrets no GitHub e faça o push!${NC}"
