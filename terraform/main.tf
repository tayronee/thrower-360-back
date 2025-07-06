# Configuração do provedor Azure
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.0"
}

# Configuração do provedor
provider "azurerm" {
  features {}
}

# Variáveis locais
locals {
  app_name = "thrower-360-back"
  location = var.location
  tags = {
    Environment = var.environment
    Project     = "Thrower-360"
    ManagedBy   = "Terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-${local.app_name}-${var.environment}"
  location = local.location
  tags     = local.tags
}

# Container Registry
resource "azurerm_container_registry" "main" {
  name                = "acr${replace(local.app_name, "-", "")}${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
  tags                = local.tags
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-${local.app_name}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.tags
}

# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${local.app_name}-${var.environment}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.tags
}

# Container App
resource "azurerm_container_app" "main" {
  name                         = "ca-${local.app_name}-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.tags

  template {
    min_replicas = 0  # Serverless - pode escalar para 0
    max_replicas = 10

    container {
      name   = local.app_name
      image  = "${azurerm_container_registry.main.login_server}/${local.app_name}:${var.container_image_tag}"
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

      # Adicione aqui outras variáveis de ambiente necessárias
      # Por exemplo, para MongoDB:
      # env {
      #   name        = "MONGODB_URI"
      #   secret_name = "mongodb-uri"
      # }
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

  # Registro do container registry
  registry {
    server   = azurerm_container_registry.main.login_server
    username = azurerm_container_registry.main.admin_username
    password_secret_name = "registry-password"
  }

  # Secrets
  secret {
    name  = "registry-password"
    value = azurerm_container_registry.main.admin_password
  }

  # Caso tenha secrets adicionais (ex: MongoDB)
  # secret {
  #   name  = "mongodb-uri"
  #   value = var.mongodb_uri
  # }
}

# Azure Monitor para Application Insights
resource "azurerm_application_insights" "main" {
  name                = "ai-${local.app_name}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "Node.JS"
  tags                = local.tags
}
