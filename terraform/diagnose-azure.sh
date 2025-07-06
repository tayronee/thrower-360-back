#!/bin/bash

echo "🔍 Diagnóstico da Azure CLI..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${YELLOW}1. Verificando login atual...${NC}"
if az account show &> /dev/null; then
    echo -e "${GREEN}✅ Logado na Azure${NC}"
    az account show --query "{name:name, id:id, state:state}" --output table
else
    echo -e "${RED}❌ Não está logado${NC}"
    echo "Execute: az login"
    exit 1
fi

echo -e "\n${YELLOW}2. Listando todas as subscriptions...${NC}"
az account list --query "[].{Name:name, SubscriptionId:id, State:state, IsDefault:isDefault}" --output table

echo -e "\n${YELLOW}3. Verificando subscription específica...${NC}"
TARGET_SUB="2a5a9002-e8d8-4baf-8237-9ba03a4fb948"
if az account show --subscription "$TARGET_SUB" &> /dev/null; then
    echo -e "${GREEN}✅ Subscription encontrada${NC}"
    az account show --subscription "$TARGET_SUB" --query "{name:name, state:state}" --output table
else
    echo -e "${RED}❌ Subscription não encontrada ou sem acesso${NC}"
fi

echo -e "\n${YELLOW}4. Testando criação de resource group...${NC}"
TEST_RG="rg-test-$(date +%s)"
if az group create --name "$TEST_RG" --location "East US" &> /dev/null; then
    echo -e "${GREEN}✅ Consegue criar recursos${NC}"
    az group delete --name "$TEST_RG" --yes --no-wait
else
    echo -e "${RED}❌ Não consegue criar recursos${NC}"
fi

echo -e "\n${YELLOW}5. Verificando permissões...${NC}"
az role assignment list --assignee $(az account show --query user.name -o tsv) --query "[].{Role:roleDefinitionName, Scope:scope}" --output table

echo -e "\n${YELLOW}Recomendações:${NC}"
echo "1. Se a subscription não aparece, sua conta pode não ter acesso"
echo "2. Se está 'Disabled' ou 'Expired', precisa reativar no portal"
echo "3. Se é uma conta trial, pode ter expirado"
echo "4. Tente fazer logout/login: az logout && az login"
