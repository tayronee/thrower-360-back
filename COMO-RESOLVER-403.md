# 🚨 ERRO 403 - COMO RESOLVER

## ❌ **Problema:**
O workflow está falhando com erro 403 porque **os secrets do GitHub Actions não estão configurados**.

## 🔐 **SOLUÇÃO:**

1. **Vá para:** `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

2. **Configure estes 6 secrets:**

| Nome do Secret | Onde encontrar o valor |
|---|---|
| `AZURE_CLIENT_ID` | Arquivo `FIX-403-ERRO.md` |
| `AZURE_CLIENT_SECRET` | Arquivo `FIX-403-ERRO.md` |  
| `AZURE_SUBSCRIPTION_ID` | Arquivo `FIX-403-ERRO.md` |
| `AZURE_TENANT_ID` | Arquivo `FIX-403-ERRO.md` |
| `ARM_ACCESS_KEY` | Execute: `az storage account keys list --account-name stthrower1751761403 --resource-group rg-terraform-state --query "[0].value" --output tsv` |
| `AZURE_CREDENTIALS` | JSON com os 4 primeiros valores (veja `FIX-403-ERRO.md`) |

3. **Configure também:**
   - `MONGODB_URI_PROD`: Sua string de conexão MongoDB de produção

## ✅ **Após configurar todos os secrets:**

1. Cancele as execuções do GitHub Actions em andamento
2. Faça um novo push ou execute o workflow manualmente  
3. O erro 403 será resolvido

## 🔍 **Verificação:**
- Você deve ver 6-7 secrets em `Settings` → `Secrets and variables` → `Actions`
- O workflow não deve mais falhar com erro de autenticação

## 🚀 **Status do Deploy:**
- ✅ Service Principal criado e válido
- ✅ Storage Account e backend funcionando
- ✅ Controle de concorrência configurado  
- ✅ Deploy apenas produção (branch main)
- ❌ **Secrets precisam ser configurados no GitHub** ← **FAÇA ISSO AGORA**
