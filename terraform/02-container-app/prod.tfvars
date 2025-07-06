# prod.tfvars - Configuração para produção
# Este arquivo é usado pelo GitHub Actions

environment = "prod"
location    = "Brazil South"

# A tag da imagem será definida dinamicamente pelo GitHub Actions
# container_image_tag será passado via -var no GitHub Actions

# Configurações de escalabilidade para produção
# min_replicas = 1  # Pelo menos 1 instância sempre rodando
# max_replicas = 20 # Máximo de 20 instâncias

# CORS origins para produção (configure seus domínios)
cors_origins = [
  "https://yourdomain.com",
  "https://www.yourdomain.com"
]
