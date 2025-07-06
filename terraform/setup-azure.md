# Configuração da Azure para Terraform com GitHub Actions

## 1. Criar Service Principal para o GitHub Actions

Execute os seguintes comandos no Azure CLI:

```bash
# 1. Fazer login na Azure
az login

# 2. Listar suas subscrições
az account list --output table

# 3. Definir a subscrição ativa (substitua pelo ID da sua subscrição)
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# 4. Criar o Service Principal
az ad sp create-for-rbac --name "sp-thrower-360-github" \
  --role "Contributor" \
  --scopes "/subscriptions/YOUR_SUBSCRIPTION_ID" \
  --sdk-auth

# O comando acima retornará algo como:
# {
#   "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
#   "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
#   "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
#   "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
# }
```

## 2. Criar Storage Account para o Terraform State

```bash
# 1. Criar Resource Group para o Terraform State
az group create --name "rg-terraform-state" --location "East US"

# 2. Criar Storage Account (nome deve ser único globalmente)
az storage account create \
  --name "stthrower360terraform" \
  --resource-group "rg-terraform-state" \
  --location "East US" \
  --sku "Standard_LRS"

# 3. Criar container para o tfstate
az storage container create \
  --name "tfstate" \
  --account-name "stthrower360terraform"

# 4. Obter a chave do storage account
az storage account keys list \
  --resource-group "rg-terraform-state" \
  --account-name "stthrower360terraform" \
  --query '[0].value' -o tsv
```

## 3. Configurar Secrets no GitHub

Vá para o seu repositório no GitHub:
1. Settings → Secrets and variables → Actions
2. Clique em "New repository secret" e adicione:

### Secrets necessários:

- **AZURE_CREDENTIALS**: Cole todo o JSON retornado pelo comando `az ad sp create-for-rbac`
- **AZURE_CLIENT_ID**: O `clientId` do Service Principal
- **AZURE_CLIENT_SECRET**: O `clientSecret` do Service Principal
- **AZURE_SUBSCRIPTION_ID**: O `subscriptionId` da sua Azure
- **AZURE_TENANT_ID**: O `tenantId` da sua Azure
- **ARM_ACCESS_KEY**: A chave do storage account (resultado do último comando acima)

## 4. Verificar informações necessárias

### Para o backend.tf:
- **resource_group_name**: `rg-terraform-state`
- **storage_account_name**: `stthrower360terraform` (ou o nome que você escolheu)
- **container_name**: `tfstate`
- **key**: `thrower-360-back.tfstate`

### Para obter sua Subscription ID:
```bash
az account show --query id -o tsv
```

### Para obter seu Tenant ID:
```bash
az account show --query tenantId -o tsv
```

## 5. Comandos úteis para verificar

```bash
# Verificar se o Service Principal foi criado
az ad sp list --display-name "sp-thrower-360-github"

# Verificar se o storage account existe
az storage account show --name "stthrower360terraform" --resource-group "rg-terraform-state"

# Listar containers no storage account
az storage container list --account-name "stthrower360terraform"
```

## 6. Primeiro deploy manual (opcional)

Para testar se tudo está funcionando:

```bash
# No diretório terraform/
terraform init
terraform plan
terraform apply
```

## Notas importantes:

1. **Nome do Storage Account**: Deve ser único globalmente (apenas letras minúsculas e números)
2. **Localização**: Mantenha tudo na mesma região (ex: East US)
3. **Service Principal**: Tenha cuidado com as permissões - Contributor é suficiente
4. **Secrets**: Nunca commite credenciais no código
