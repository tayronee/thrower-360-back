# Infrastructure-only resources (without Container App)
# This file is used to create the base infrastructure before Docker image is available

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
    key                  = "infrastructure.tfstate"
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

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-${local.app_name}-${var.environment}"
  location = var.location
  tags     = local.tags
}

# Container Registry
resource "azurerm_container_registry" "main" {
  name                = "acr${local.app_name}${var.environment}"
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

# Container App Environment
resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${local.app_name}-${var.environment}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.tags
}

# Outputs para usar no próximo passo
output "container_registry_login_server" {
  value = azurerm_container_registry.main.login_server
}

output "container_registry_admin_username" {
  value = azurerm_container_registry.main.admin_username
}

output "container_registry_admin_password" {
  value     = azurerm_container_registry.main.admin_password
  sensitive = true
}

output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "container_app_environment_id" {
  value = azurerm_container_app_environment.main.id
}
