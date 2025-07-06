# 🔧 ERRO 403 RESOLVIDO - Service Principal Expirado

## ❌ Problema identificado:
O Service Principal anterior (`4c15e7ec-8e5a-43da-a5c8-ee3af8000000`) **expirou**.

## ✅ Solução aplicada:
1. **Novo Service Principal criado**: `0ff149ea-b2d7-4050-b06e-6e9ab0cd339a`
2. **Backend do Terraform testado e funcionando**
3. **Storage Account confirmado**: `stthrower1751761403` com container `tfstate`

## 🔐 Configure estes secrets no GitHub:

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Nome | Valor |
|---|---|
| `AZURE_CLIENT_ID` | `0ff149ea-b2d7-4050-b06e-6e9ab0cd339a` |
| `AZURE_SUBSCRIPTION_ID` | `2a5a9002-e8d8-4baf-8237-9ba03a4fb948` |
| `AZURE_TENANT_ID` | `920a79d5-9020-4f56-8cfc-f2cae79e7e00` |

### Para obter os valores sensíveis, execute:

```bash
# 1. Client Secret (do novo Service Principal)
echo "Novo SP criado - use o client secret do comando create-for-rbac"

# 2. Storage Access Key
az storage account keys list \
  --account-name stthrower1751761403 \
  --resource-group rg-terraform-state \
  --query "[0].value" \
  --output tsv

# 3. AZURE_CREDENTIALS (JSON completo)
echo '{
  "clientId": "0ff149ea-b2d7-4050-b06e-6e9ab0cd339a",
  "clientSecret": "<use-client-secret-do-novo-sp>",
  "subscriptionId": "2a5a9002-e8d8-4baf-8237-9ba03a4fb948",
  "tenantId": "920a79d5-9020-4f56-8cfc-f2cae79e7e00"
}'
```

## 🚀 Status do Deploy:
- ✅ **Workflow com controle de concorrência** (apenas 1 deploy por vez)
- ✅ **Deploy apenas produção** (branch `main`)
- ✅ **Backend remoto funcionando** (Storage Account + container)
- ✅ **Service Principal válido** (novo, não expirado)
- ✅ **100% serverless** (min_replicas=0, auto-scale)

### 📝 Próximos passos:
1. Configure os secrets acima no GitHub
2. Faça push para `main`
3. Deploy executará automaticamente apenas 1 vez
