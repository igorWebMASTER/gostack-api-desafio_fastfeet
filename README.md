<p align="center">
  <a href="" rel="noopener">
 <img alt="Fastfeet" title="Fastfeet" src="https://raw.githubusercontent.com/Rocketseat/bootcamp-gostack-desafio-02/master/.github/logo.png" width="300px" /></a>
</p>

<h3 align="center">Desafio 02: FastFett, o início</h3>

---

## :rocket: Sobre o desafio

Criar uma aplicação para uma transportadora fictícia, o FastFeet.
A aplicação deve conter funcionalidades basicas de criação e atualização de destinatários, autenticação de usuário e validação de dados

### Este projeto foi desenvolvido com:

<ul>
  <li><a href="https://nodejs.org/en/">Node</a></li>
  <li><a href="https://legacy.yarnpkg.com/">Yarn</a></li>
  <li><a href="https://expressjs.com">Express</a></li>
  <li><a href="https://nodemon.io/">Nodemon</a></li>
  <li><a href="https://sucrase.io/">Sucrase</a></li>
  <li><a href="https://eslint.org/">ESLint</li>
  <li><a href="https://prettier.io/">Prettier</li>
  <li><a href="https://editorconfig.org/">EditorConfig</li>
  <li><a href="https://sequelize.org/">Sequelize</li>
  <li><a href="https://jwt.io/">JWT</li>
  <li><a href="https://www.npmjs.com/package/bcrypt">Bcrypt</li>
  <li><a href="https://www.npmjs.com/package/yup">Yup</li>  
</ul>

---

### Comandos para rodar o projeto

`yarn -i` para instalar as dependências.
`yarn dev` para iniciar o servidor já com o nodemon

---

### Comando para debug no VS Code

`yarn dev:debug`

### Rotas

- `POST /sessions`: A rota deve receber `email` e `password` válidos dentro do corpo para realizar a criação de uma sessão para o usário, que irá gerar um token JWT para ser usado em outras rotas como forma de autenticação.

- `POST /recipients`: A rota deve receber `name`, `street`, `number`, `complement`, `city`, `state`, `zip_code` e armazenar um novo destinatários no banco de dados. A validação dos dados será feita através da biblioteca Yup;

- `GET /recipients`: Rota que lista todos destinatários;

- `GET /recipients/:id`: Rota que lista apenas o destinatário com id informado

- `PUT /recipients/:id`: A rota deve atualizar apenas os dados do destinatário com o `id` presente nos parâmetros da rota, uma confirmação se os dados passados já existem em outro recipient será feita, retornando o ID caso essa combinação seja encontrada no banco;

- `DELETE /recipients/:id`: A rota deve deletar o destinatário com o `id` presente nos parâmetros da rota;

---

### Criando um usuário administrador

Permita que um usuário se autentique em sua aplicação utilizando e-mail e uma senha.

Crie um usuário administrador utilizando a funcionalidade de seeds do sequelize, essa funcionalidade serve para criarmos registros na base de dados de forma automatizada.

Para criar um seed utilize o comando:
`yarn sequelize db:seed:all`

O comando irá criar o seguinte usuário no banco de dados:
`{ name: "Distribuidora FastFeet", email: "admin@fastfeet.com", password_hash: bcrypt.hashSync("123456", 8), created_at: new Date(), updated_at: new Date() }`

Agora você tem um usuário na sua base de dados, utilize esse usuário para todos os logins que você fizer.

### CRUD de destinatário

As rotas de CRUD do destinatário fazem uso de autenticação via token JWT gerado a partir da autenticação do usuário.
Os campos a serem informados para criação e atualização passam por uma validação de dados por meio da biblioteca Yup.
