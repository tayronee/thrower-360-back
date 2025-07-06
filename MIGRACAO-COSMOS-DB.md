# Migração para Azure Cosmos DB (MongoDB API) - FREE TIER

## ✅ Benefícios da Migração

### 🚀 **Problemas Resolvidos:**
- ❌ **IP dinâmico**: Não precisa mais configurar IPs no MongoDB Atlas
- ❌ **Dependência externa**: Tudo dentro do Azure
- ❌ **Latência**: Mesmo datacenter (Brazil South)
- ❌ **Custos**: Free tier permanente (400 RUs/s + 25GB)

### 💰 **Cosmos DB Free Tier:**
- **400 Request Units/s grátis para sempre**
- **25 GB storage grátis**
- **MongoDB API 100% compatível**
- **Auto-scaling serverless**
- **Backup automático**

## 🏗️ Arquitetura Atualizada

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  GitHub Actions │────│ Azure Container  │────│ Azure Cosmos DB │
│   (CI/CD)       │    │      Apps        │    │  (MongoDB API)  │
│                 │    │   (Serverless)   │    │  (Free Tier)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
    Terraform                 Docker              MongoDB Compatible
    Automation               Container             Connection String
```

## 📝 Mudanças Implementadas

### 1. **Infraestrutura Terraform**
- ✅ Adicionado `terraform/01-infrastructure/cosmos-mongodb.tf`
- ✅ Cosmos DB com MongoDB API
- ✅ Free tier habilitado
- ✅ Collections criadas automaticamente

### 2. **Container App**
- ✅ Connection string automática do Cosmos DB
- ✅ Removido dependency de secrets externos
- ✅ Mantida compatibilidade MONGODB_URI/MONGO_URI

### 3. **GitHub Actions**
- ✅ Removido secret `MONGODB_URI_PROD` 
- ✅ Simplificado workflow (sem passar connection string)
- ✅ Deploy totalmente automatizado

## 🗂️ Estrutura de Dados

### Database: `thrower360db`
### Collections criadas automaticamente:
- `pregoes` - Dados dos pregões
- `pregaodetalhes` - Detalhes dos pregões

## 🚀 Deploy

### Próximo Deploy irá:
1. **Criar Cosmos DB** automaticamente
2. **Configurar connection string** automaticamente  
3. **Aplicação conectar** sem configuração manual

### Comando:
```bash
git add .
git commit -m "feat: migração para Azure Cosmos DB (MongoDB API) free tier"
git push origin main
```

## 🔍 Verificação Pós-Deploy

### 1. Testar Endpoints
```bash
# Health check
curl https://thrower-360-back.orangerock-c4c0e1c5.brazilsouth.azurecontainerapps.io/health

# API funcionando
curl https://thrower-360-back.orangerock-c4c0e1c5.brazilsouth.azurecontainerapps.io/pregoes
```

### 2. Verificar Cosmos DB no Portal Azure
1. Acesse [portal.azure.com](https://portal.azure.com)
2. Resource Group: `rg-thrower360-prod`
3. Cosmos DB: `cosmos-thrower360-prod`
4. Data Explorer → ver collections

### 3. Monitorar Logs
```bash
az containerapp logs show \
  --name ca-thrower360-prod \
  --resource-group rg-thrower360-prod \
  --follow
```

## 💾 Dados Existentes

### ⚠️ **Importante:** 
Os dados atuais no MongoDB Atlas **NÃO serão migrados automaticamente**.

### Opções:
1. **Começar limpo** (recomendado para desenvolvimento)
2. **Migração manual** (se houver dados importantes):
   ```bash
   # Exportar do Atlas
   mongodump --uri "mongodb+srv://..." --out ./backup
   
   # Importar para Cosmos DB
   mongorestore --uri "sua-cosmos-connection-string" ./backup
   ```

## 🔧 Desenvolvimento Local

### Connection String Local (Cosmos DB):
```bash
# .env
MONGODB_URI="AccountEndpoint=https://cosmos-thrower360-prod.mongo.cosmos.azure.com:10255/;AccountKey=...;ApiKind=MongoDb;AppName=@cosmos-thrower360-prod@"
```

### Obter Connection String:
```bash
az cosmosdb keys list \
  --name cosmos-thrower360-prod \
  --resource-group rg-thrower360-prod \
  --type connection-strings
```

## 📊 Monitoramento e Custos

### Free Tier Limits:
- **400 RUs/s** = ~1000 requests/minuto
- **25 GB storage**
- **Suficiente para desenvolvimento e pequena produção**

### Alertas (configurar se necessário):
- RU consumption > 80%
- Storage > 20GB
- Failed requests

## 🆘 Troubleshooting

### Se não conectar:
1. **Verificar resource group e nomes**
2. **Confirmar que Cosmos DB foi criado**
3. **Verificar logs do Container App**
4. **Testar connection string manual**

### Rollback (se necessário):
```bash
# Voltar para MongoDB Atlas temporariamente
# Editar terraform/02-container-app/container-app.tf
# Adicionar secret manual e reverter
```

---

## ✅ Status da Migração

- ✅ **Terraform configurado** (Cosmos DB + Container App)
- ✅ **GitHub Actions atualizado** (sem secrets MongoDB)
- ✅ **Application code** já compatível
- ✅ **Documentation** criada
- ⏳ **Deploy pendente** (próximo push)

**Resultado:** Deploy 100% Azure, serverless, gratuito e sem problemas de IP! 🎉
