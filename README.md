# 🍔 FrontendHamburgueria - MoroBurger

Sistema de delivery para restaurantes ou lanchonetes, desenvolvido com React, TypeScript, Vite e integração completa com backend via API REST. Permite gerenciamento de produtos, pedidos, autenticação de usuários (cliente e admin), carrinho de compras e painel administrativo.

BACKEND: https://github.com/marcelomoro1/BackendHamburgueria
---

## 🚀 Tecnologias Utilizadas

- **React 18+** (SPA)
- **TypeScript**
- **Vite** (build e dev server)
- **React Router DOM** (roteamento)
- **React Query** (cache e requisições assíncronas)
- **Axios** (HTTP client)
- **Context API** (autenticação global)
- **CSS Modules** (estilização modular)
- **JWT** (autenticação segura)

--- 

## ⚙️ Funcionalidades

- **Catálogo de Produtos:** Visualização de produtos por categoria.
- **Carrinho de Compras:** Adição, remoção e visualização de itens.
- **Checkout:** Finalização de compra com opções de pagamento.
- **Histórico de Pedidos:** Usuário pode acompanhar seus pedidos.
- **Autenticação JWT:** Login, logout, roles (cliente/admin).
- **Painel Admin:** Gerenciamento de produtos e pedidos.
- **Proteção de Rotas:** Acesso restrito por autenticação e papel.
- **Responsividade:** Layout adaptado para desktop e mobile.

---

## 🛠️ Instalação e Execução

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/marcelomoro1/FrontendHamburgueria.git
   cd FrontendHamburgueria
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o backend:**
   - Certifique-se de que o backend está rodando em `http://localhost:8080/api` (ou ajuste em `src/service/api.ts`).

4. **Inicie o projeto:**
   ```bash
   npm run dev
   ```

5. **Acesse:**
   - [http://localhost:5173](http://localhost:5173)

---

## 🔒 Autenticação & Roles

- **Cliente:** Pode comprar, ver pedidos, editar perfil.
- **Admin:** Pode acessar dashboards, gerenciar produtos e pedidos.
- **JWT:** Token salvo no localStorage, renovado a cada login.

---

## 🧩 Principais Componentes

- `ProdutoLista`: Lista de produtos, integração com carrinho e feedback visual.
- `CarrinhoModal`: Visualização e edição do carrinho em modal.
- `CheckoutPage`: Finalização de compra com resumo do pedido.
- `LoginForm` / `RegisterForm`: Autenticação e cadastro de usuários.
- `AdminDashboard`: Painel administrativo com atalhos para gestão.
- `GerenciarProdutos`: CRUD de produtos com modais e feedback.
- `GerenciarPedidos`: Visualização e atualização de pedidos.
- `MeusPedidosPage`: Histórico de pedidos do usuário autenticado.
- `Modal`: Componente reutilizável para janelas modais.

---

## 📦 Scripts Disponíveis

- `npm run dev` — Inicia o servidor de desenvolvimento.
- `npm run build` — Gera build de produção.
- `npm run preview` — Visualiza build localmente.

---

## Informações extras

- **Hot Reload:** O Vite garante recarregamento instantâneo ao salvar arquivos.
- **TypeScript estrito:** O projeto usa tipagem forte para evitar bugs.
- **React Query:** Use para cache e atualização automática de dados.
- **Context API:** Centraliza autenticação e roles do usuário.
- **CSS modular:** Cada componente tem seu próprio arquivo de estilo.

---


> Projeto desenvolvido para fins didáticos e demonstração de arquitetura moderna em React + TypeScript.
