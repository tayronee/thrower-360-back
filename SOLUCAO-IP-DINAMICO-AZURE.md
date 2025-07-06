# Solução para IP Dinâmico - Azure Container Apps + MongoDB Atlas

## Problema
O Azure Container Apps é serverless e **o IP muda a cada deploy/restart**. Isso quebra a conexão com MongoDB Atlas que usa whitelist de IPs.

## IP Atual da Aplicação
```bash
# Para verificar o IP atual:
nslookup thrower-360-back.orangerock-c4c0e1c5.brazilsouth.azurecontainerapps.io
# ou
dig +short thrower-360-back.orangerock-c4c0e1c5.brazilsouth.azurecontainerapps.io
```

## Soluções (em ordem de preferência)

### 1. **RECOMENDADO: Ranges de IP do Azure Brazil South**
Configure no MongoDB Atlas os ranges de IP oficiais da região Brazil South:

```
# Azure Brazil South IP Ranges (principais)
191.233.0.0/16
191.234.0.0/16
191.235.0.0/16
104.41.0.0/16
20.206.0.0/16
20.201.0.0/16
```

**Como aplicar:**
1. Acesse [MongoDB Atlas](https://cloud.mongodb.com/)
2. Vá em **Security → Network Access**
3. Clique **Add IP Address**
4. Adicione cada range acima (um por vez)
5. Descrição: "Azure Brazil South - Container Apps"

### 2. **Para Desenvolvimento: Liberar Tudo (0.0.0.0/0)**
⚠️ **APENAS para desenvolvimento/testes**

```
0.0.0.0/0
```

### 3. **Solução Robusta: VNet Integration (Futuro)**
Para produção enterprise, considere:
- Azure Virtual Network (VNet)
- VNet Integration no Container Apps
- MongoDB Atlas Private Endpoint
- IP fixo via NAT Gateway

## Como Verificar se Funcionou

### 1. Teste Local (deve funcionar)
```bash
curl http://localhost:3000/health
```

### 2. Teste Produção (após liberar IP)
```bash
curl https://thrower-360-back.orangerock-c4c0e1c5.brazilsouth.azurecontainerapps.io/health
curl https://thrower-360-back.orangerock-c4c0e1c5.brazilsouth.azirecontainerapps.io/pregoes
```

### 3. Verificar Logs no Azure
```bash
az containerapp logs show \
  --name thrower-360-back \
  --resource-group rg-thrower-360-prod \
  --follow
```

## Monitoramento de IP

### Script para Monitorar Mudanças de IP
```bash
#!/bin/bash
# monitor-ip.sh
while true; do
  NEW_IP=$(dig +short thrower-360-back.orangerock-c4c0e1c5.brazilsouth.azurecontainerapps.io)
  echo "$(date): IP atual = $NEW_IP"
  sleep 300  # Verifica a cada 5 minutos
done
```

## Troubleshooting

### Se ainda não conectar após liberar IPs:
1. **Verifique a string de conexão MongoDB:**
   ```bash
   # No Azure Container Apps, verificar secret:
   az containerapp secret list --name thrower-360-back --resource-group rg-thrower-360-prod
   ```

2. **Teste conexão direta:**
   ```bash
   # Conectar via mongo shell para testar
   mongosh "sua-connection-string-aqui"
   ```

3. **Verificar logs detalhados:**
   ```bash
   az containerapp logs show --name thrower-360-back --resource-group rg-thrower-360-prod --tail 100
   ```

## Status Atual
- ✅ Deploy automatizado funcionando
- ✅ Container App rodando
- ✅ Secrets configurados (mongodb-uri)
- ⏳ **PENDENTE: Liberar ranges de IP no MongoDB Atlas**
- ⏳ Testar endpoints após liberação

## Próximos Passos
1. **URGENTE:** Adicionar ranges de IP do Azure no MongoDB Atlas
2. Testar endpoints `/health` e `/pregoes`
3. Monitorar logs para confirmar conexão MongoDB
4. (Opcional) Configurar alertas para mudanças de IP

---
**Nota:** O Azure Container Apps é pay-per-use e serverless. IPs dinâmicos são normais neste modelo. Use ranges de IP para produção segura.
