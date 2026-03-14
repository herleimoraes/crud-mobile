# 📱 Gestão de Clientes - Mobile-First CRUD

Um aplicativo web focado em dispositivos móveis (Mobile-First) para gerenciamento de clientes. Construído com conceitos de **Single Page Application (SPA)** e **Progressive Web App (PWA)**, integrado a um banco de dados real utilizando **Supabase**.

## 🚀 Funcionalidades

* **CRUD Completo:** Criação, Leitura, Atualização e Exclusão de clientes em tempo real.
* **Mobile-First & Responsivo:** Interface otimizada para uso com uma mão, utilizando componentes do Bootstrap 5 (Bottom Navigation, Floating Action Button, Cards).
* **PWA (Progressive Web App):** Instalável na tela inicial do smartphone, com suporte offline básico via Service Workers.
* **Single Page Application (SPA):** Navegação fluida entre as abas (Dashboard, Clientes e Ajustes) sem recarregar a página.
* **Dark Mode Integrado:** Troca de tema dinâmico (Claro/Escuro) salvo no `localStorage` do dispositivo.
* **Feedback Visual (UX):** Uso de Toasts (notificações flutuantes) e modais animados para confirmação de ações destrutivas, substituindo os alertas nativos do navegador.

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3, JavaScript (Vanilla)
* **Estilização:** Bootstrap 5 (via CDN) & Bootstrap Icons
* **Back-end / BaaS:** Supabase (PostgreSQL)
* **Hospedagem:** GitHub Pages

## 📦 Estrutura do Banco de Dados (Supabase)

O sistema utiliza uma tabela chamada `clientes` com a seguinte estrutura e políticas de segurança (RLS - Row Level Security) configuradas para acesso público/anônimo:

```sql
create table clientes (
  id bigint primary key generated always as identity,
  nome text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
