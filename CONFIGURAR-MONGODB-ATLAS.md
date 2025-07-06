# 🔧 CONFIGURAÇÃO MONGODB ATLAS - GUIA ESPECÍFICO

## 📍 **INFORMAÇÕES DO CONTAINER APP AZURE:**

- **Container App URL:** `https://ca-thrower360-prod.blueflower-2258fa9c.eastus.azurecontainerapps.io/`
- **IP Público identificado:** `57.152.50.203`
- **Região Azure:** East US
- **Status:** Container App sobe mas não conecta no MongoDB (IP bloqueado)

## 🚨 **PROBLEMA CONFIRMADO:**
```
✅ Container App deployment: OK
✅ SSL/TLS connection: OK  
✅ Container startup: OK
❌ MongoDB connection: BLOCKED (IP não autorizado)
```

## 🎯 **SOLUÇÃO MONGODB ATLAS:**

### **OPÇÃO 1: IP ESPECÍFICO (Recomendado para produção)**

1. **Acesse MongoDB Atlas:**
   - Vá para: https://cloud.mongodb.com/
   - Login na sua conta

2. **Configure Network Access:**
   ```
   Database Access → Network Access → Add IP Address
   ```

3. **Adicione o IP específico:**
   ```
   IP Address: 57.152.50.203/32
   Comment: Azure Container App East US - thrower360-prod
   ```

4. **⚠️ ATENÇÃO:** IPs do Azure podem mudar. Se parar de funcionar, verifique novo IP.

### **OPÇÃO 2: RANGE COMPLETO AZURE EAST US**

Para evitar problemas com mudanças de IP, adicione o range completo do Azure East US:

```
IP Range: 40.64.0.0/10
Comment: Azure East US Region

IP Range: 52.152.0.0/13  
Comment: Azure East US Region 2

IP Range: 20.0.0.0/8
Comment: Azure Services
```

### **OPÇÃO 3: TEMPORÁRIA - PERMITIR TODOS (apenas para teste)**

```
IP Address: 0.0.0.0/0
Comment: TEMPORARY - Allow all IPs for testing
```

**⚠️ IMPORTANTE:** Remova esta regra após o teste!

## ✅ **APÓS CONFIGURAR NO ATLAS:**

### **1. Aguarde 1-2 minutos** para propagação

### **2. Teste Health Check:**
```bash
curl https://ca-thrower360-prod.blueflower-2258fa9c.eastus.azurecontainerapps.io/
```

**✅ Deve retornar:**
```json
{"status":"ok","timestamp":"2025-01-24T...","environment":"prod"}
```

### **3. Teste API Pregões:**
```bash
curl https://ca-thrower360-prod.blueflower-2258fa9c.eastus.azurecontainerapps.io/pregoes
```

**✅ Deve retornar:**
```json
[{"_id":"...","numero":"...","objeto":"..."}]
```

## 📊 **VERIFICAR LOGS APÓS CONFIGURAÇÃO:**

```bash
# Aguardar 2-3 minutos e verificar logs
az containerapp logs show --name ca-thrower360-prod --resource-group rg-thrower360-prod --follow=false --tail=30
```

**✅ Deve aparecer:**
```
MongoDB connected successfully
Server listening on port 3000
```

## 🔄 **SE AINDA NÃO FUNCIONAR:**

### **1. Verificar novo IP (caso tenha mudado):**
```bash
curl -v https://ca-thrower360-prod.blueflower-2258fa9c.eastus.azurecontainerapps.io/ 2>&1 | grep "IPv4"
```

### **2. Verificar Connection String no MongoDB Atlas:**
- Database → Connect → Connect your application
- Copiar a connection string
- Verificar se corresponde à variável `MONGODB_URI` no GitHub Secrets

### **3. Verificar variáveis de ambiente:**
```bash
az containerapp show --name ca-thrower360-prod --resource-group rg-thrower360-prod --query "properties.template.containers[0].env" --output table
```

## 🛡️ **CONFIGURAÇÃO SEGURA PARA PRODUÇÃO:**

### **Após confirmar que funciona, configure:**

1. **VNet Integration** (mais seguro)
2. **Private Endpoints** 
3. **Remover regra 0.0.0.0/0** se foi usada
4. **Usar apenas IPs específicos ou ranges do Azure**

## 📝 **PRÓXIMOS PASSOS:**

1. ✅ Configurar IP no MongoDB Atlas (escolher uma das opções acima)
2. ⏳ Aguardar 1-2 minutos
3. 🧪 Testar endpoints (`/` e `/pregoes`)
4. 📊 Verificar logs para confirmar conexão MongoDB
5. 🛡️ Implementar configuração segura (VNet) se necessário

---
**Status:** IP identificado (`57.152.50.203`) - MongoDB Atlas precisa autorizar este IP.
