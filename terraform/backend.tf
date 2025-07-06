# backend.tf - Configuração do backend remoto
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "stthrower1751761535"
    container_name       = "tfstate"
    key                  = "thrower-360-back.tfstate"
  }
}
