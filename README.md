# back-end-360

## Visão Geral

Este projeto utiliza **NestJS** com **TypeScript** e segue os princípios da **Clean Architecture** para garantir separação de responsabilidades, testabilidade e flexibilidade. O banco de dados utilizado é o **MongoDB**, integrado via **Mongoose**.

---

## Estrutura de Pastas

```
src/
├── modules/
│   └── user/
│       ├── domain/
│       │   ├── entities/
│       │   │   └── user.entity.ts
│       │   └── repositories/
│       │       └── user.repository.interface.ts
│       ├── application/
│       │   └── use-cases/
│       │       └── create-user.use-case.ts
│       ├── infrastructure/
│       │   └── repositories/
│       │       └── user.repository.mongo.ts
│       ├── interfaces/
│       │   ├── dtos/
│       │   │   └── create-user.dto.ts
│       │   ├── http/
│       │   │   └── user.controller.ts
│       │   └── schemas/
│       │       └── user.schema.ts
│       └── user.module.ts
```

---

## Padrões e Princípios Utilizados

- **Clean Architecture:** Separação em camadas (domain, application, infrastructure, interfaces).
- **Dependency Injection:** Fornecido nativamente pelo NestJS.
- **Repository Pattern:** Interface de repositório desacoplada da implementação.
- **Use Case Pattern:** Casos de uso isolados na camada de aplicação.
- **DTOs com validação:** Utilização de DTOs para entrada/saída e validação de dados.
- **Controllers enxutos:** Apenas recebem requisições e delegam para os casos de uso.

---

## Fluxo de Criação de Usuário

1. **Controller** recebe a requisição HTTP e valida o DTO.
2. O controller chama o **Use Case** (`CreateUserUseCase`).
3. O use case depende apenas da **interface do repositório**.
4. A implementação concreta do repositório (MongoDB/Mongoose) é injetada via provider.
5. O repositório realiza a persistência e retorna o resultado.

---

## Como rodar o projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/backend360
   ```

3. Rode o projeto:
   ```bash
   npm run start:dev
   ```

---

## Observações

- Para adicionar novos módulos, siga a mesma estrutura de camadas.
- Para trocar a implementação do repositório, basta criar uma nova classe e registrar no provider do módulo.
- O projeto está pronto para testes unitários e integração, devido ao desacoplamento das camadas.

---

## Tecnologias

- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
