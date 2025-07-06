# Container App resource only
# This file is used to create/update the Container App after Docker image is available

terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "stthrower360terraform"
    container_name       = "tfstate"
    key                  = "container-app.tfstate"
  }
}

provider "azurerm" {
  features {}
}

locals {
  app_name = "thrower360"
  tags = {
    Environment = var.environment
    Application = local.app_name
    ManagedBy   = "Terraform"
  }
}

# Data sources para buscar recursos já criados
data "azurerm_resource_group" "main" {
  name = "rg-${local.app_name}-${var.environment}"
}

data "azurerm_container_registry" "main" {
  name                = "acr${local.app_name}${var.environment}"
  resource_group_name = data.azurerm_resource_group.main.name
}

data "azurerm_container_app_environment" "main" {
  name                = "cae-${local.app_name}-${var.environment}"
  resource_group_name = data.azurerm_resource_group.main.name
}

# Container App
resource "azurerm_container_app" "main" {
  name                         = "ca-${local.app_name}-${var.environment}"
  container_app_environment_id = data.azurerm_container_app_environment.main.id
  resource_group_name          = data.azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.tags

  template {
    min_replicas = 0  # Serverless - pode escalar para 0
    max_replicas = 10

    container {
      name   = local.app_name
      image  = "${data.azurerm_container_registry.main.login_server}/${local.app_name}:${var.container_image_tag}"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "NODE_ENV"
        value = var.environment
      }

      env {
        name  = "PORT"
        value = "3000"
      }

      # MongoDB connection string
      dynamic "env" {
        for_each = var.mongodb_uri != "" ? [1] : []
        content {
          name        = "MONGODB_URI"
          secret_name = "mongodb-uri"
        }
      }
    }

    # Configuração de escalabilidade baseada em HTTP
    http_scale_rule {
      name                = "http-requests"
      concurrent_requests = 30
    }
  }

  # Configuração de ingress para expor o serviço
  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 3000
    transport                  = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  # Secrets
  dynamic "secret" {
    for_each = var.mongodb_uri != "" ? [1] : []
    content {
      name  = "mongodb-uri"
      value = var.mongodb_uri
    }
  }

  # Registro do container registry
  registry {
    server   = data.azurerm_container_registry.main.login_server
    username = data.azurerm_container_registry.main.admin_username
    password_secret_name = "registry-password"
  }

  secret {
    name  = "registry-password"
    value = data.azurerm_container_registry.main.admin_password
  }
}

# Outputs
output "container_app_url" {
  value = "https://${azurerm_container_app.main.ingress[0].fqdn}"
}

output "container_app_fqdn" {
  value = azurerm_container_app.main.ingress[0].fqdn
}
