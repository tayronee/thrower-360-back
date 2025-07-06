# Solução para o erro MANIFEST_UNKNOWN

## Problema

O erro `MANIFEST_UNKNOWN: manifest tagged by "..." is not found` ocorria porque o Terraform tentava criar o Azure Container App antes da imagem Docker estar disponível no Azure Container Registry (ACR).

### Erro original:
```
Field 'template.containers.thrower-360-back.image' is invalid with details: 
'Invalid value: "acrthrower360backprod.azurecr.io/thrower-360-back:63df9b7c26f112d4695cf57a80964bf08a9c0da0": 
GET https:: MANIFEST_UNKNOWN: manifest tagged by "63df9b7c26f112d4695cf57a80964bf08a9c0da0" is not found
```

## Solução

Reorganizamos o deployment em **3 etapas sequenciais**:

### Etapa 1: Criar infraestrutura base
- Resource Group
- Azure Container Registry (ACR)
- Log Analytics Workspace  
- Container App Environment

### Etapa 2: Build e push da imagem Docker
- Login no ACR
- Build da imagem Docker
- Push da imagem para o ACR

### Etapa 3: Criar Container App
- Criar Container App usando a imagem que agora existe no ACR

## Estrutura dos arquivos

```
terraform/
├── 01-infrastructure/          # Infraestrutura base
│   ├── infrastructure.tf      # Recursos: RG, ACR, Log Analytics, CAE
│   ├── variables.tf           # Variáveis
│   ├── backend.tf            # Backend state (infrastructure.tfstate)
│   └── prod.tfvars           # Configurações de produção
├── 02-container-app/          # Container App
│   ├── container-app.tf      # Recurso: Container App
│   ├── variables.tf          # Variáveis
│   ├── backend.tf           # Backend state (container-app.tfstate)
│   └── prod.tfvars          # Configurações de produção
└── test-deploy.sh           # Script para teste local
```

## Workflow GitHub Actions

O novo workflow `.github/workflows/deploy.yml` executa:

1. **Infraestrutura**: `terraform apply` no diretório `01-infrastructure`
2. **Docker Build**: Build e push da imagem usando credenciais do ACR
3. **Container App**: `terraform apply` no diretório `02-container-app`

## Vantagens da solução

1. ✅ **Ordem correta**: Imagem existe antes do Container App ser criado
2. ✅ **Estados separados**: Cada etapa tem seu próprio state file
3. ✅ **Idempotência**: Pode executar múltiplas vezes sem problemas
4. ✅ **Rollback**: Pode voltar etapas individuais se necessário
5. ✅ **Debugging**: Easier to debug issues in specific steps

## Comandos para testar localmente

```bash
# Configurar variáveis de ambiente (obrigatório)
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
export AZURE_TENANT_ID="your-tenant-id"
export ARM_ACCESS_KEY="your-storage-access-key"
export MONGODB_URI="your-mongodb-connection-string"

# Executar teste
./test-deploy.sh
```

## Secrets necessários no GitHub

- `AZURE_CREDENTIALS` (JSON com service principal)
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_TENANT_ID`
- `ARM_ACCESS_KEY`
- `MONGODB_URI` (dev)
- `MONGODB_URI_PROD` (prod)

## Deploy triggers

- **Dev**: Push para branch `main`
- **Prod**: Release published (GitHub release with tag)
