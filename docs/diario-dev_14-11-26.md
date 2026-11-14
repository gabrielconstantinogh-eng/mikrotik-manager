# MikroTik Manager — Diário de desenvolvimento

> **Registro atualizado em:** 14/11/2026  
> **Estado do projeto:** aplicação Electron + React executando corretamente no Linux Mint, com interface componentizada, navegação entre páginas e fonte Poppins aplicada globalmente.

Este documento registra o que foi criado e configurado até agora, as decisões técnicas tomadas e os próximos passos. A ideia é manter um histórico útil para retomar o desenvolvimento no futuro sem depender apenas do histórico da conversa.

---

## 1. Objetivo do projeto

O **MikroTik Manager** é uma aplicação desktop para organizar e administrar equipamentos MikroTik.

A proposta inicial é permitir que o administrador cadastre roteadores e mantenha seus dados de conexão organizados, com possibilidade de abrir o WinBox nativo do sistema operacional.

### Funcionalidades planejadas

- Cadastro de equipamentos MikroTik.
- Identificação por nome, endereço IP, porta e usuário.
- Gerenciamento de favoritos.
- Organização de vários roteadores em uma única interface.
- Verificação de conectividade e estado online/offline.
- Histórico de conexões recentes.
- Inicialização do WinBox nativo no Windows e no Linux.
- Futuras funções de monitoramento e automação.
- Possível integração com serviços Python/FastAPI e infraestrutura centralizada.

**Importante:** os itens acima representam a visão do produto. Nem todos estão implementados ainda. Até este registro, a aplicação possui a estrutura visual e a navegação; o cadastro real de roteadores, testes de conectividade e integração com WinBox ainda são etapas futuras.

---

## 2. Tecnologias utilizadas até agora

| Tecnologia | Utilização |
|---|---|
| Electron | Aplicação desktop para Windows e Linux |
| React | Construção da interface |
| electron-vite | Desenvolvimento e build do projeto Electron |
| Vite | Ferramenta de desenvolvimento do frontend |
| Tailwind CSS 4 | Estilização da interface |
| Lucide React | Ícones |
| React Router DOM | Navegação entre páginas |
| Fontsource Poppins | Fonte Poppins hospedada localmente no projeto |
| Node.js / npm | Ambiente JavaScript e gerenciamento de dependências |

### Ambiente de desenvolvimento

- Sistema utilizado no desenvolvimento: **Linux Mint**.
- Editor disponível: VS Code.
- O trabalho também foi realizado diretamente pelo terminal, utilizando `mkdir`, `touch`, `cd` e `nano`.
- Comando usado para iniciar o ambiente de desenvolvimento:

```bash
npm run dev
```

---

## 3. Criação do projeto Electron

O projeto foi criado com o gerador `@quick-start/electron`:

```bash
npm create @quick-start/electron@latest
```

O projeto foi nomeado:

```text
mikrotik-manager
```

Diretório utilizado:

```text
~/Área de trabalho/mikrotik-manager
```

A estrutura inicial fornecida pelo gerador incluiu os arquivos principais do Electron, preload e renderer.

### Scripts npm disponíveis

Entre os scripts configurados no `package.json` estão:

```bash
npm run dev
npm run build
npm run start
npm run build:unpack
npm run build:win
npm run build:linux
```

- `npm run dev`: inicia o ambiente de desenvolvimento.
- `npm run build`: gera os arquivos de build.
- `npm run start`: abre a versão de preview.
- `npm run build:unpack`: gera uma versão empacotada sem instalador.
- `npm run build:win`: prepara o pacote para Windows.
- `npm run build:linux`: prepara o pacote para Linux.

A geração dos instaladores finais ainda deve ser testada nas etapas de distribuição.

---

## 4. Instalação e configuração do Tailwind CSS

Foi instalado o Tailwind CSS 4 e seu plugin para Vite:

```bash
npm install -D tailwindcss @tailwindcss/vite
```

O arquivo `electron.vite.config.mjs` foi atualizado para carregar o plugin do Tailwind no renderer.

Configuração atual:

```js
import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
```

O CSS principal foi simplificado para utilizar a diretiva de importação do Tailwind 4:

```css
@import "tailwindcss";
```

Arquivo:

```text
src/renderer/src/assets/main.css
```

O arquivo `main.jsx` já importa esse CSS, portanto não foi necessário alterar essa importação para habilitar o Tailwind.

---

## 5. Instalação dos ícones

Foi instalada a biblioteca Lucide React:

```bash
npm install lucide-react
```

Os ícones são utilizados diretamente nos componentes React. Exemplos usados na interface:

- `LayoutDashboard`
- `Router`
- `Network`
- `Activity`
- `Settings`
- `Bell`
- `Plus`
- `Server`
- `Wifi`

Exemplo de uso:

```jsx
import { Router } from 'lucide-react'

function Exemplo() {
  return <Router size={23} />
}
```

---

## 6. Interface inicial — Dashboard

Foi criada uma interface inicial com tema escuro, utilizando tons de azul, cinza e slate.

### Elementos da interface

**Barra lateral:**
- Identificação MikroTik Manager.
- Dashboard.
- Equipamentos.
- Conexões.
- Monitoramento.
- Configurações.
- Identificação da versão 0.1.0.

**Cabeçalho:**
- Título e descrição da página.
- Ícone de notificações.
- Avatar ilustrativo.

**Indicadores do Dashboard:**
- Equipamentos cadastrados.
- Equipamentos online.
- Conexões recentes.

**Área de equipamentos:**
- Título “Meus equipamentos”.
- Botão “Adicionar MikroTik”.
- Estado vazio informando que nenhum equipamento foi cadastrado.

**Rodapé:**
- Identificação do aplicativo e ano.
- Indicador visual de aplicação em execução.

Os números exibidos nos indicadores ainda são valores ilustrativos/estáticos. Eles deverão ser ligados aos dados reais quando a camada de persistência e integração for desenvolvida.

---

## 7. Refatoração em componentes

A primeira versão da interface estava concentrada em `App.jsx`. Para facilitar manutenção e evolução, a interface foi dividida em componentes reutilizáveis, layout e páginas.

### Estrutura atual do renderer

```text
src/
├── main/
│   └── index.js
├── preload/
│   └── index.js
└── renderer/
    ├── index.html
    └── src/
        ├── assets/
        │   └── main.css
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Header.jsx
        │   ├── StatCard.jsx
        │   └── EquipmentSection.jsx
        ├── layouts/
        │   └── MainLayout.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   └── PlaceholderPage.jsx
        ├── App.jsx
        └── main.jsx
```

### Responsabilidade de cada arquivo

| Arquivo | Responsabilidade |
|---|---|
| `App.jsx` | Define o roteamento e associa caminhos às páginas |
| `main.jsx` | Ponto de entrada React; importa CSS e fontes e monta a aplicação |
| `components/Sidebar.jsx` | Barra lateral e links de navegação |
| `components/Header.jsx` | Cabeçalho reutilizável das páginas |
| `components/StatCard.jsx` | Cartão reutilizável para indicadores |
| `components/EquipmentSection.jsx` | Área de equipamentos do Dashboard |
| `layouts/MainLayout.jsx` | Estrutura compartilhada: Sidebar, conteúdo e rodapé |
| `pages/Dashboard.jsx` | Conteúdo da página principal |
| `pages/PlaceholderPage.jsx` | Página provisória reutilizável para seções ainda em desenvolvimento |
| `assets/main.css` | Importação do Tailwind e regras globais de fonte |

### Conceitos adotados

- **Componentes:** partes menores e reutilizáveis da interface.
- **Páginas:** telas completas, cada uma com sua finalidade.
- **Layout:** estrutura comum que envolve as páginas.
- **Props:** propriedades usadas para enviar informações a componentes, como título e descrição.
- **Children / Outlet:** mecanismo para inserir o conteúdo de uma página dentro do layout.

Essa organização evita que todo o código da interface fique concentrado em um único arquivo.

---

## 8. Navegação entre páginas

Foi instalado o React Router DOM:

```bash
npm install react-router-dom
```

A navegação foi implementada usando `HashRouter`, adequado ao contexto de uma aplicação Electron empacotada, evitando depender de rotas de servidor para abrir caminhos internos.

A configuração de rotas fica em `App.jsx`.

### Rotas implementadas

| Caminho interno | Página |
|---|---|
| `#/` | Dashboard |
| `#/equipamentos` | Equipamentos |
| `#/conexoes` | Conexões |
| `#/monitoramento` | Monitoramento |
| `#/configuracoes` | Configurações |

A estrutura utiliza:

- `HashRouter`: mantém a navegação baseada em hash.
- `Routes`: agrupa as rotas.
- `Route`: associa cada caminho a um componente.
- `Outlet`: apresenta a página dentro do layout principal.
- `NavLink`: cria links de navegação e permite identificar qual seção está ativa.

A barra lateral foi organizada a partir de uma lista de itens (`menuItems`), evitando repetir manualmente a estrutura de cada link. O estilo ativo é definido com base na propriedade `isActive` do `NavLink`.

### Estado das páginas

- Dashboard: interface inicial implementada.
- Equipamentos: página provisória.
- Conexões: página provisória.
- Monitoramento: página provisória.
- Configurações: página provisória.

A navegação entre todas essas páginas foi testada e está funcionando.

---

## 9. Fonte Poppins

Foi escolhida a fonte **Poppins**, com estilo sans-serif, para ser utilizada em toda a aplicação.

A dependência foi instalada localmente:

```bash
npm install @fontsource/poppins
```

No `main.jsx`, foram adicionados os imports dos pesos utilizados:

```jsx
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
```

O CSS global foi configurado para aplicar Poppins:

```css
@import "tailwindcss";

@theme {
  --font-sans: "Poppins", sans-serif;
}

@layer base {
  body {
    font-family: "Poppins", sans-serif;
  }
}
```

Com o Fontsource, os arquivos da fonte fazem parte das dependências do projeto. Assim, a interface não precisa baixar a fonte do Google Fonts durante a execução e pode utilizá-la offline.

A aplicação foi aberta novamente e a fonte Poppins está funcionando.

---

## 10. Estado atual — checklist

### Ambiente e estrutura

- [x] Criar projeto Electron com React.
- [x] Criar projeto `mikrotik-manager`.
- [x] Executar a aplicação em modo de desenvolvimento.
- [x] Configurar Tailwind CSS 4.
- [x] Instalar Lucide React.
- [x] Criar a interface inicial do Dashboard.
- [x] Refatorar a interface em componentes.
- [x] Separar componentes, layouts e páginas.

### Interface e navegação

- [x] Criar Sidebar.
- [x] Criar Header reutilizável.
- [x] Criar cartões de indicadores.
- [x] Criar seção de equipamentos.
- [x] Criar layout principal.
- [x] Instalar React Router DOM.
- [x] Configurar navegação com HashRouter.
- [x] Criar rotas para as cinco seções.
- [x] Indicar visualmente a página ativa na Sidebar.
- [x] Instalar e aplicar Poppins globalmente.
- [x] Testar a aplicação após as alterações.

### Funcionalidades ainda não implementadas

- [ ] Formulário funcional de cadastro de MikroTik.
- [ ] Persistência local dos equipamentos.
- [ ] Edição e exclusão de equipamentos.
- [ ] Armazenamento seguro das credenciais.
- [ ] Teste de conectividade (ping).
- [ ] Abertura do WinBox nativo.
- [ ] Detecção de estado online/offline.
- [ ] Histórico real de conexões.
- [ ] Integração com RouterOS API.
- [ ] Integração com backend Python/FastAPI.
- [ ] Sistema de monitoramento e alertas.
- [ ] Empacotamento e testes no Windows e Linux.

---

## 11. Comandos úteis para continuar o desenvolvimento

Entrar na pasta do projeto:

```bash
cd "$HOME/Área de trabalho/mikrotik-manager"
```

Iniciar o ambiente:

```bash
npm run dev
```

Gerar build:

```bash
npm run build
```

Verificar o estado do Git:

```bash
git status
```

Visualizar o histórico:

```bash
git log --oneline
```

---

## 12. Git — registrar esta etapa

Este é um bom momento para registrar o estado atual do projeto. O commit abaixo descreve a criação da base visual, a organização em componentes, a navegação e a configuração da tipografia.

Execute na raiz do projeto:

```bash
git add . && git commit \
  -m "feat: estrutura inicial da interface e navegacao" \
  -m "Cria a interface desktop do MikroTik Manager com Electron e React." \
  -m "Configura Tailwind CSS 4 e Lucide React." \
  -m "Refatora a interface em componentes reutilizaveis, layout e paginas." \
  -m "Implementa navegacao entre Dashboard, Equipamentos, Conexoes, Monitoramento e Configuracoes usando React Router com HashRouter." \
  -m "Adota a fonte Poppins localmente por meio do Fontsource e aplica a tipografia globalmente." \
  -m "Valida a execucao da aplicacao, a navegacao e a identidade visual no Linux Mint."
```

### Se o Git ainda não estiver inicializado

Confira primeiro:

```bash
git status
```

Se aparecer uma mensagem informando que o diretório não é um repositório Git, inicialize-o:

```bash
git init
```

Depois, configure sua identidade (use seu nome e e-mail associados ao Git):

```bash
git config user.name "Seu Nome"
git config user.email "seu-email@example.com"
```

Em seguida, execute o comando de commit acima.

> Se o commit for rejeitado por falta de identidade, configure nome e e-mail e tente novamente. Não é necessário configurar isso globalmente; os comandos acima afetam somente este repositório.

---

## 13. Próximas etapas sugeridas

Uma sequência prudente para continuar:

1. **Cadastro de equipamentos:** criar formulário com nome, IP/hostname, porta, usuário, senha e favorito.
2. **Persistência:** salvar e recuperar os equipamentos quando o aplicativo for fechado e aberto novamente.
3. **Segurança:** definir armazenamento seguro de credenciais, sem gravar senhas em texto puro.
4. **Conectividade:** implementar teste de conexão e estado online/offline.
5. **WinBox:** abrir o executável nativo do sistema com os parâmetros necessários, avaliando cuidadosamente como fornecer credenciais.
6. **Monitoramento:** adicionar histórico, métricas e alertas.
7. **Backend:** avaliar a integração com Python/FastAPI e serviços centralizados quando houver necessidade real.

A ordem pode ser ajustada conforme os testes e as decisões de arquitetura. Em especial, segurança de credenciais deve ser considerada antes de implementar o cadastro persistente.

---

## 14. Observação de manutenção

Atualize este documento sempre que uma etapa relevante for concluída. É útil registrar:

- O que foi alterado.
- Quais arquivos foram criados ou modificados.
- Quais dependências foram adicionadas.
- Quais comandos foram executados.
- Como validar a alteração.
- O que ainda falta fazer.

Prefira commits pequenos e descritivos, agrupando alterações que formam uma etapa coerente. Antes de cada commit, confira `git status` e, se necessário, revise as diferenças com `git diff`.

**Ponto de partida para a próxima sessão:** a interface e a navegação estão funcionando. A próxima funcionalidade sugerida é implementar o cadastro real de equipamentos MikroTik.