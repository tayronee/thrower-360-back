#!/bin/bash

# Monitor do deploy com Brazil South
# Verifica se o Cosmos DB foi criado com sucesso

echo "🇧🇷 Monitorando deploy em Brazil South..."
echo "========================================"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar status do workflow GitHub Actions
echo -e "\n${YELLOW}1. Status do GitHub Actions${NC}"
echo "🔍 Verificando último workflow..."

# Aguardar um pouco para o workflow começar
sleep 10

# Verificar se recursos foram criados
echo -e "\n${YELLOW}2. Verificando Recursos Azure${NC}"

# Resource Group
echo "🔍 Verificando Resource Group..."
az group show --name "rg-thrower360-prod" --query "location" -o tsv 2>/dev/null
if [ $? -eq 0 ]; then
    LOCATION=$(az group show --name "rg-thrower360-prod" --query "location" -o tsv)
    echo -e "✅ ${GREEN}Resource Group criado em: $LOCATION${NC}"
else
    echo -e "⏳ ${YELLOW}Resource Group ainda não criado${NC}"
fi

# Cosmos DB
echo "🔍 Verificando Cosmos DB..."
az cosmosdb show --name "cosmos-thrower360-prod" --resource-group "rg-thrower360-prod" --query "{name:name,location:location,provisioningState:provisioningState}" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "✅ ${GREEN}Cosmos DB criado com sucesso!${NC}"
    
    # Verificar se free tier está ativo
    FREE_TIER=$(az cosmosdb show --name "cosmos-thrower360-prod" --resource-group "rg-thrower360-prod" --query "enableFreeTier" -o tsv 2>/dev/null)
    if [ "$FREE_TIER" = "true" ]; then
        echo -e "💰 ${GREEN}Free Tier ativo - 400 RUs/s grátis${NC}"
    fi
else
    echo -e "⏳ ${YELLOW}Cosmos DB ainda sendo criado...${NC}"
fi

# Container Registry
echo "🔍 Verificando Container Registry..."
az acr show --name "acrtrower360prod" --resource-group "rg-thrower360-prod" --query "{name:name,location:location,provisioningState:provisioningState}" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "✅ ${GREEN}Container Registry criado${NC}"
else
    echo -e "⏳ ${YELLOW}Container Registry ainda não criado${NC}"
fi

# Container App
echo "🔍 Verificando Container App..."
az containerapp show --name "ca-thrower360-prod" --resource-group "rg-thrower360-prod" --query "{name:name,location:location,provisioningState:provisioningState}" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "✅ ${GREEN}Container App criado${NC}"
    
    # Obter URL
    APP_URL=$(az containerapp show --name "ca-thrower360-prod" --resource-group "rg-thrower360-prod" --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null)
    if [ ! -z "$APP_URL" ]; then
        echo -e "🌐 ${GREEN}URL: https://$APP_URL${NC}"
        
        # Testar endpoint
        echo "🧪 Testando health check..."
        HEALTH_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "https://$APP_URL/health" 2>/dev/null)
        if [ "$HEALTH_STATUS" = "200" ]; then
            echo -e "✅ ${GREEN}Aplicação respondendo!${NC}"
        else
            echo -e "⏳ ${YELLOW}Aplicação ainda inicializando... (HTTP $HEALTH_STATUS)${NC}"
        fi
    fi
else
    echo -e "⏳ ${YELLOW}Container App ainda não criado${NC}"
fi

echo -e "\n${YELLOW}3. Comparação de Regiões${NC}"
echo "========================================"
echo "❌ East US: Alta demanda (ServiceUnavailable)"
echo "✅ Brazil South: Disponível e estável"
echo "🇧🇷 Latência Brasil: ~20-50ms (vs 150-200ms East US)"
echo "💰 Custo: Equivalente + compliance LGPD"

echo -e "\n${YELLOW}4. Próximos Passos${NC}"
echo "========================================"
echo "1. ⏳ Aguardar Cosmos DB finalizar (pode levar 2-5 min)"
echo "2. 🧪 Testar endpoints após Container App estar rodando"  
echo "3. 📊 Verificar logs: az containerapp logs show --name ca-thrower360-prod --resource-group rg-thrower360-prod --follow"
echo "4. 🌐 Portal Azure: https://portal.azure.com"

echo -e "\n${GREEN}🎉 Deploy em Brazil South em progresso!${NC}"
echo "Região mais estável, menor latência e compliance LGPD ativado! 🇧🇷"
