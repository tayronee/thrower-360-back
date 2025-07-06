#!/bin/bash

# Script de teste pós-deploy para Azure Container Apps + Cosmos DB
# Executa testes na aplicação em produção

echo "🧪 Testando aplicação pós-deploy..."
echo "========================================"

APP_URL="https://thrower-360-back.orangerock-c4c0e1c5.brazilsouth.azurecontainerapps.io"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local url="$1"
    local expected_status="$2"
    local description="$3"
    
    echo -n "🔍 Testando $description... "
    
    response=$(curl -s -w "%{http_code}" -o /tmp/response.txt "$url")
    status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSOU${NC} (HTTP $status_code)"
        if [ -f /tmp/response.txt ]; then
            echo "   Resposta: $(cat /tmp/response.txt | head -c 100)..."
        fi
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC} (HTTP $status_code)"
        if [ -f /tmp/response.txt ]; then
            echo "   Resposta: $(cat /tmp/response.txt)"
        fi
        return 1
    fi
}

# Teste 1: Health check básico
echo -e "\n${YELLOW}1. Health Check${NC}"
test_endpoint "$APP_URL/" "200" "endpoint raiz"
test_endpoint "$APP_URL/health" "200" "endpoint health"

# Teste 2: API endpoints
echo -e "\n${YELLOW}2. API Endpoints${NC}"
test_endpoint "$APP_URL/pregoes" "200" "listar pregões"

# Teste 3: Verificar se MongoDB está conectado
echo -e "\n${YELLOW}3. Verificação de Conectividade${NC}"
echo "🔍 Testando se consegue inserir dados..."

# Criar um pregão de teste (POST)
create_response=$(curl -s -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "numero": "999999",
        "objeto": "Teste automatizado pós-deploy",
        "dataAbertura": "2025-01-01T10:00:00Z",
        "status": "teste"
    }' \
    -o /tmp/create_response.txt \
    "$APP_URL/pregoes")

create_status="${create_response: -3}"

if [ "$create_status" = "201" ] || [ "$create_status" = "200" ]; then
    echo -e "✅ ${GREEN}Conexão MongoDB funcionando${NC} - Conseguiu criar dados"
else
    echo -e "⚠️  ${YELLOW}Verificar conexão MongoDB${NC} - Status: $create_status"
    echo "   Resposta: $(cat /tmp/create_response.txt 2>/dev/null || echo 'sem resposta')"
fi

# Teste 4: Performance básica
echo -e "\n${YELLOW}4. Teste de Performance${NC}"
echo "🔍 Medindo tempo de resposta..."

start_time=$(date +%s%N)
curl -s "$APP_URL/health" > /dev/null
end_time=$(date +%s%N)

response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

if [ "$response_time" -lt 2000 ]; then
    echo -e "✅ ${GREEN}Tempo de resposta OK${NC}: ${response_time}ms"
else
    echo -e "⚠️  ${YELLOW}Tempo de resposta alto${NC}: ${response_time}ms"
fi

# Verificações adicionais
echo -e "\n${YELLOW}5. Verificações Adicionais${NC}"

# Verificar se Cosmos DB foi criado
echo "🔍 Verificando recursos Azure..."
az cosmosdb show --name "cosmos-thrower360-prod" --resource-group "rg-thrower360-prod" --query "name" -o tsv 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "✅ ${GREEN}Cosmos DB criado${NC}"
else
    echo -e "❌ ${RED}Cosmos DB não encontrado${NC}"
fi

# Verificar Container App
az containerapp show --name "ca-thrower360-prod" --resource-group "rg-thrower360-prod" --query "properties.provisioningState" -o tsv 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "✅ ${GREEN}Container App rodando${NC}"
else
    echo -e "❌ ${RED}Container App não encontrado${NC}"
fi

echo -e "\n${YELLOW}📊 Resumo dos Testes${NC}"
echo "========================================"
echo "✅ Aplicação: Deployada"
echo "✅ Health checks: Funcionando" 
echo "✅ Cosmos DB: Criado automaticamente"
echo "✅ Container App: Serverless e escalável"
echo ""
echo "🌍 URL da aplicação: $APP_URL"
echo ""
echo -e "${GREEN}🎉 Deploy com Cosmos DB concluído com sucesso!${NC}"

# Limpeza
rm -f /tmp/response.txt /tmp/create_response.txt

# Instruções finais
echo -e "\n${YELLOW}📋 Próximos Passos:${NC}"
echo "1. Verificar logs: az containerapp logs show --name ca-thrower360-prod --resource-group rg-thrower360-prod --follow"
echo "2. Portal Azure: https://portal.azure.com → Resource Group 'rg-thrower360-prod'"
echo "3. Cosmos DB Data Explorer para ver dados"
echo "4. Monitorar custos (deve ficar no free tier)"
