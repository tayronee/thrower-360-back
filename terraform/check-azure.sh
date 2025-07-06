#!/bin/bash

# Script para verificar e configurar a subscrição Azure correta

echo "🔍 Verificando configuração da Azure..."

# Verificar se está logado
if ! az account show &> /dev/null; then
    echo "❌ Você não está logado na Azure CLI"
    echo "Execute: az login"
    exit 1
fi

echo "📋 Subscrições disponíveis:"
az account list --output table

echo ""
echo "📍 Subscrição atual:"
az account show --query "{name:name, id:id, state:state}" --output table

echo ""
echo "Se você precisar trocar a subscrição, execute:"
echo "az account set --subscription \"SUBSCRIPTION_ID_OR_NAME\""
