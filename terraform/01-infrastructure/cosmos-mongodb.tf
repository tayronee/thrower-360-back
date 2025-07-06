# Azure Cosmos DB (MongoDB API) - Free Tier
# Adicionando ao módulo de infraestrutura

# Cosmos DB Account with MongoDB API
resource "azurerm_cosmosdb_account" "mongodb" {
  name                = "cosmos-thrower360-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  # Free Tier - 400 RUs/s e 25GB grátis
  free_tier_enabled = true

  consistency_policy {
    consistency_level = "Session"
  }

  capabilities {
    name = "EnableMongo"
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  tags = local.tags
}

# MongoDB Database
resource "azurerm_cosmosdb_mongo_database" "main" {
  name                = "thrower360db"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.mongodb.name
}

# Collections principais
resource "azurerm_cosmosdb_mongo_collection" "pregoes" {
  name                = "pregoes"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.mongodb.name
  database_name       = azurerm_cosmosdb_mongo_database.main.name

  index {
    keys   = ["_id"]
    unique = true
  }
}

resource "azurerm_cosmosdb_mongo_collection" "pregao_detalhes" {
  name                = "pregaodetalhes"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.mongodb.name
  database_name       = azurerm_cosmosdb_mongo_database.main.name

  index {
    keys   = ["_id"]
    unique = true
  }
}

# Output da connection string
output "cosmos_mongodb_connection_string" {
  value     = azurerm_cosmosdb_account.mongodb.primary_mongodb_connection_string
  sensitive = true
}
