# 🔐 Secrets necessários no GitHub

Para o deploy funcionar, você precisa configurar estes secrets no GitHub:

## 📋 Lista de Secrets

Vá em **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 🔑 **Service Principal (obrigatórios):**
- `AZURE_CLIENT_ID`: `4c15e7ec-8e5a-43da-a5c8-ee3af8000000`
- `AZURE_CLIENT_SECRET`: `YOUR_CLIENT_SECRET`
- `AZURE_SUBSCRIPTION_ID`: `YOUR_SUBSCRIPTION_ID` 
- `AZURE_TENANT_ID`: `YOUR_TENANT_ID`

### 🗄️ **Storage Account:**
- `ARM_ACCESS_KEY`: `<sua-chave-do-storage-account>`

### 📱 **AZURE_CREDENTIALS (JSON):**
```json
{
  "clientId": "4c15e7ec-8e5a-43da-a5c8-ee3af8000000",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "subscriptionId": "YOUR_SUBSCRIPTION_ID", 
  "tenantId": "YOUR_TENANT_ID"
}
```

### 🗃️ **MongoDB:**
- `MONGODB_URI_PROD`: `mongodb://your-prod-connection-string`

## ✅ **Verificação rápida:**

Execute este comando para obter os valores corretos:

```bash
# Service Principal Info
az ad sp show --id 4c15e7ec-8e5a-43da-a5c8-ee3af8000000 --query "{clientId:appId, tenantId:ownerOrganization}" --output table

# Subscription ID
az account show --query id --output tsv

# Storage Access Key (obtenha com o comando abaixo)
az storage account keys list --account-name stthrower1751761403 --resource-group rg-terraform-state --query "[0].value" --output tsv
```

## 🚀 **Após configurar todos os secrets:**

1. Faça push para `main`
2. O deploy será **APENAS PRODUÇÃO**
3. Será criado: `rg-thrower360-prod`, `acrtrower360prod`, `ca-thrower360-prod`
