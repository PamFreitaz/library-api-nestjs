#  Library API (NestJS)

Bem-vindo ao repositório da **Library API**! Uma API RESTful robusta desenvolvida com **NestJS** para gerenciamento de acervos, locações, relatórios analíticos de biblioteca e aplicação de regras de negócio automatizadas.

O projeto foi construído aplicando conceitos de arquitetura limpa, separação de responsabilidades (Controllers, Services, DTOs e Repositories) e tipagem estrita com TypeScript.

---

##  Tecnologias Utilizadas

O projeto faz uso das seguintes tecnologias e bibliotecas presentes no ecossistema Node.js:

*   **Framework:** [NestJS v10](https://nestjs.com)
*   **Linguagem:** [TypeScript v5](https://typescriptlang.org)
*   **Banco de Dados:** SQL Server (MSSQL Local/Docker)
*   **ORM:** [TypeORM](https://typeorm.io)
*   **Documentação:** [Swagger/OpenAPI v11](https://swagger.io)
*   **Validação de Dados:** `class-validator` & `class-transformer`
*   **Gerenciador de Pacotes:** `Yarn`

---

##  Funcionalidades e Regras de Negócio Resolvidas

A API conta com um CRUD completo de livros integrado ao banco de dados SQL Server e uma série de serviços inteligentes que resolvem desafios avançados de lógica:

###  CRUD de Livros
*   **Cadastro (`POST`):** Instancia entidades no banco calculando a faixa etária baseada em regras internas. Inclui logs operacionais em tempo real e proteção de integridade com blocos `try/catch`.
*   **Listagem (`GET`):** Retorna todos os registros injetando de forma dinâmica etiquetas catalográficas calculadas sob demanda.
*   **Atualização (`PATCH`):** Permite atualizações parciais de dados aplicando o operador de *Coalescência Nula (`??`)* e o *Spread Operator (`...`)* para reclassificar as regras caso quantidade de páginas ou categoria mudem.
*   **Exclusão (`DELETE`):** Remove livros de forma definitiva tratando exceções caso o ID não exista.

###  Geração de Catalogação Dinâmica
Gera identificadores de catalogação exclusivos com base na posição indexada dos itens, utilizando lógica de múltiplos matemáticos:
*   Múltiplos de 3 e 5 ao mesmo tempo: Recebem o prefixo `ACERVO-`
*   Múltiplos apenas de 3: Recebem o prefixo `REF-`
*   Múltiplos apenas de 5: Recebem o prefixo `DEST-`
*   Demais posições: Recebem o prefixo padrão `LIV-`

###  Resumo de Entrada no Acervo por Período
Busca as inserções no banco em um intervalo de datas e utiliza o método `.reduce()` para agrupar livros repetidos pelo título em uma estrutura de dicionário (`Record<string, object>`). O serviço calcula o acumulado investido e devolve uma string limpa formatada com quebras de linha (`\n`), pluralização correta de palavras (`exemplar`/`exemplares`) e valores monetários ajustados para duas casas decimais com `.toFixed(2)`.

###  Lógica Avançada de Descontos em Empréstimos
Calcula o preço final do aluguel com base em critérios estritos que não se acumulam, elegendo apenas a maior vantagem:
*   Livros com preço base menor que R\$ 30,00 não recebem desconto.
*   Usuários identificados como Sócios ganham 20% de desconto.
*   Usuários com o cupom `ESTUDANTE` (tratado com `.toUpperCase()`) ganham 15% de desconto.

### Relatório Analítico de Empréstimos Diários
Recebe uma coleção de registros por DTO e processa os dados de maneira declarativa linha a linha usando laços `for...of` tradicionais combinados com o desmanche de objetos pelo `Object.entries()`. O método devolve um objeto contendo:
1. O dia exato de maior movimento de empréstimos (privilegiando o primeiro a chegar ao topo em empates).
2. O dia de menor movimento de empréstimos.
3. A média diária com formatação numérica precisa.
4. O total de dias que fecharam acima da média estipulada.
5. Um bônus que faz a contagem de frequência de retirada de livros e lista todos os campeões da semana (tratando empates e adicionando-os em lista via `.push()`).

---

## Como Executar o Projeto

Siga os passos abaixo para rodar a aplicação em seu ambiente de desenvolvimento:

### 1. Clonar o Repositório
```bash
git clone https://github.com
cd library-api-nestjs
```

### 2. Instalar as Dependências
Instale todos os pacotes listados no `package.json` utilizando o Yarn:
```bash
yarn install
```

### 3. Configurar as Variáveis de Ambiente (`.env`)
Crie um arquivo `.env` na raiz do projeto e configure as credenciais de conexão do seu banco de dados SQL Server. *(Lembrando que o arquivo `.env` está protegido e ignorado no Git pelo `.gitignore`)*.

### 4. Rodar as Migrations do Banco
Garante que a sua tabela `books` e suas respectivas colunas sejam criadas corretamente na sua base `library_db`:
```bash
yarn migration:run
```

### 5. Iniciar a Aplicação
Para rodar a API em modo de desenvolvimento assistido (com atualização automática no VS Code):
```bash
yarn start:dev
```

---

## Testando as Rotas na Interface do Swagger

Com a aplicação rodando, abra o seu navegador de preferência e digite o endereço de documentação ativa:

```text
http://localhost:3000/api
```
*(ou altere para `/docs` dependendo da configuração estabelecida no seu arquivo `main.ts`)*

Dentro da interface do Swagger, você poderá clicar nos botões **"Try it out"** de rotas como a `POST /relatorio/emprestimo` e injetar corpos de requisição (`Body`) personalizados para testar os retornos matemáticos calculados pela API.

---
Desenvolvido por PamFreitaz.
