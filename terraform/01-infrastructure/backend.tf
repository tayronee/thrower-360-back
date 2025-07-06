terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "stthrower1751761403"
    container_name       = "tfstate"
    key                  = "infrastructure.tfstate"
  }
}
