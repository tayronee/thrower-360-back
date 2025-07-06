# Deploy com Terraform e GitHub Actions

Este documento explica como configurar e usar o Terraform com GitHub Actions para fazer deploy na Azure.

## 📋 Pré-requisitos

1. **Conta na Azure** com permissões para criar recursos
2. **Azure CLI** instalado localmente
3. **Terraform** instalado localmente (opcional, para testes locais)
4. **Repositório no GitHub** com este código

## 🔧 Configuração Inicial

### 1. Configurar Service Principal na Azure

Execute o script para criar os recursos necessários:

```bash
./terraform/setup-azure.sh
```

**OU** execute manualmente:

```bash
# 1. Login na Azure
az login

# 2. Criar Service Principal
az ad sp create-for-rbac --name "thrower-360-sp" --role contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID --sdk-auth

# 3. Criar Resource Group para o Terraform State
az group create --name rg-terraform-state --location "East US"

# 4. Criar Storage Account para o Terraform State
az storage account create \
  --name stthrower360terraform \
  --resource-group rg-terraform-state \
  --location "East US" \
  --sku Standard_LRS

# 5. Criar Container no Storage Account
az storage container create \
  --name tfstate \
  --account-name stthrower360terraform
```

### 2. Configurar Secrets no GitHub

Vá para **Settings → Secrets and variables → Actions** no seu repositório e adicione:

#### Secrets obrigatórios:
- `AZURE_CREDENTIALS`: Output completo do comando `az ad sp create-for-rbac`
- `MONGODB_URI`: String de conexão do MongoDB para desenvolvimento
- `MONGODB_URI_PROD`: String de conexão do MongoDB para produção

#### Exemplo do AZURE_CREDENTIALS:
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 3. Configurar Variáveis do Terraform

#### Para deploy local:
1. Copie o arquivo de exemplo:
   ```bash
   cp terraform/terraform.tfvars.example terraform/terraform.tfvars
   ```

2. Edite `terraform/terraform.tfvars` com seus valores:
   ```hcl
   environment = "dev"
   location    = "East US"
   mongodb_uri = "mongodb+srv://user:password@cluster.mongodb.net/database"
   jwt_secret  = "your-super-secret-jwt-key"
   cors_origins = ["http://localhost:3000", "https://yourdomain.com"]
   ```

#### Para GitHub Actions:
As variáveis são configuradas no workflow (`.github/workflows/deploy.yml`) e nos arquivos:
- `terraform/terraform.tfvars.example` (template)
- `terraform/prod.tfvars` (configuração de produção)

## 🚀 Como usar

### Deploy automático via GitHub Actions:

1. **Desenvolvimento**: Push para branch `develop`
2. **Produção**: Push para branch `main`
3. **Validação**: Abrir Pull Request para `main`

### Deploy manual local:

```bash
cd terraform

# Inicializar Terraform
terraform init

# Planejar mudanças
terraform plan -var="container_image_tag=latest"

# Aplicar mudanças
terraform apply -var="container_image_tag=latest"

# Fazer build e deploy da aplicação
./deploy.sh
```

## 🗂️ Estrutura de Arquivos

```
terraform/
├── main.tf                    # Recursos principais
├── variables.tf               # Definição das variáveis
├── outputs.tf                 # Outputs do Terraform
├── backend.tf                 # Configuração do backend remoto
├── terraform.tfvars.example   # Exemplo de configuração
├── prod.tfvars               # Configuração de produção
├── setup-azure.sh            # Script de configuração inicial
└── deploy.sh                 # Script de deploy manual

.github/workflows/
└── deploy.yml                # Workflow do GitHub Actions
```

## 🌍 Ambientes

### Development (branch: develop)
- Environment: `dev`
- Resource Group: `rg-thrower-360-back-dev`
- Container App: `ca-thrower-360-back-dev`

### Production (branch: main)
- Environment: `prod`
- Resource Group: `rg-thrower-360-back-prod`
- Container App: `ca-thrower-360-back-prod`

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Local de configuração |
|----------|-----------|----------------------|
| `AZURE_CREDENTIALS` | Credenciais do Service Principal | GitHub Secrets |
| `MONGODB_URI` | String de conexão MongoDB (dev) | GitHub Secrets |
| `MONGODB_URI_PROD` | String de conexão MongoDB (prod) | GitHub Secrets |
| `environment` | Ambiente (dev/prod) | terraform.tfvars |
| `location` | Região da Azure | terraform.tfvars |
| `cors_origins` | Origens permitidas para CORS | terraform.tfvars |

## 🔍 Monitoramento

Após o deploy, você pode monitorar sua aplicação através:

1. **Azure Portal**: Container Apps → sua aplicação
2. **Application Insights**: Para logs e métricas
3. **Log Analytics**: Para logs detalhados

## 🚨 Troubleshooting

### Erro de permissão no Terraform State:
Verifique se o Service Principal tem acesso ao Storage Account.

### Erro de build do Docker:
Verifique se o Dockerfile está correto e se todas as dependências estão no package.json.

### Container App não inicia:
Verifique os logs no Azure Portal e as variáveis de ambiente.

## 📝 Comandos Úteis

```bash
# Ver outputs do Terraform
terraform output

# Ver logs do Container App
az containerapp logs show --name ca-thrower-360-back-dev --resource-group rg-thrower-360-back-dev

# Resetar o Container App
az containerapp revision restart --name ca-thrower-360-back-dev --resource-group rg-thrower-360-back-dev

# Destruir recursos (CUIDADO!)
terraform destroy
```
