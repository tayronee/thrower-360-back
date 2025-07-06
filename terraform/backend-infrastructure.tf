terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "stthrower360terraform"
    container_name       = "tfstate"
    key                  = "infrastructure.tfstate"
  }
}
