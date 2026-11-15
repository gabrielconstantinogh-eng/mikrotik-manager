# MikroTik Manager --- Registro de implementação

**Data do registro:** 15/11/2026\
**Escopo:** funcionalidades implementadas e verificadas nesta etapa da
conversa.

Este documento registra a evolução do MikroTik Manager durante este
dia de trabalho, incluindo arquitetura, arquivos criados ou alterados, testes
realizados, estado atual e próximo passo.

------------------------------------------------------------------------

## 1. Objetivo desta etapa

Evoluir a aplicação desktop MikroTik Manager para permitir o
gerenciamento local de roteadores MikroTik, com persistência em SQLite e
uma arquitetura que mantenha a interface desacoplada do banco de dados.

Também foi iniciada a preparação para armazenar credenciais de forma
segura, utilizando o recurso `safeStorage` do Electron.

## 2. Arquitetura adotada

A comunicação da aplicação segue este fluxo:

``` text
Interface React
      |
      v
Serviço do renderer
      |
      v
API restrita exposta pelo preload
      |
      v
IPC do Electron
      |
      v
Handlers no processo principal
      |
      v
Repositório
      |
      v
SQLite
```

Responsabilidades:

-   **React (renderer):** apresenta as telas, formulários e tabelas.
-   **Serviços do renderer:** oferecem funções de acesso aos recursos da
    aplicação sem expor detalhes do IPC à interface.
-   **Preload:** disponibiliza uma API limitada e explícita ao renderer.
-   **Processo principal (main):** executa operações privilegiadas e
    registra handlers IPC.
-   **Repositório:** concentra as consultas e alterações SQL.
-   **SQLite:** armazena os dados localmente.

Essa separação facilita uma futura integração com uma API remota e
PostgreSQL, sem exigir que toda a interface seja reescrita.

## 3. Banco de dados SQLite

Foi criada a conexão com SQLite utilizando `better-sqlite3`.

Arquivo:

``` text
src/main/database/connection.js
```

Responsabilidades implementadas:

1.  Obter o diretório de dados da aplicação por meio de
    `app.getPath('userData')`.
2.  Criar o diretório, caso necessário.
3.  Abrir o banco `mikrotik-manager.sqlite`.
4.  Habilitar o modo WAL.
5.  Habilitar as chaves estrangeiras.
6.  Criar a tabela `equipments`, caso ainda não exista.

A utilização de `app.getPath('userData')` evita salvar o banco dentro da
pasta de instalação ou do projeto. O local é definido pelo Electron
conforme o sistema operacional.

### Estrutura da tabela `equipments`

  Campo                  Finalidade
  ---------------------- --------------------------------------------
  `id`                   Identificador numérico e chave primária
  `name`                 Nome do equipamento
  `host`                 Endereço IP ou hostname
  `port`                 Porta de conexão, padrão 8291
  `username`             Usuário do equipamento
  `description`          Descrição ou observações
  `favorite`             Indicador de favorito
  `password_encrypted`   Campo reservado para a senha criptografada
  `created_at`           Data de criação
  `updated_at`           Data da última atualização

**Importante:** a coluna `password_encrypted` já existe, mas nesta etapa
ainda não foi integrada ao cadastro, à edição ou à leitura de
credenciais. Nenhuma senha foi adicionada ao CRUD implementado neste
chat.

## 4. Repositório de equipamentos

Arquivo:

``` text
src/main/database/equipmentRepository.js
```

Foi implementada a camada responsável pelas operações SQL e validações
dos dados.

### Operações disponíveis

-   `listEquipments()`: lista os equipamentos, priorizando favoritos e
    ordenando pelo nome.
-   `createEquipment(data)`: valida e cadastra um equipamento.
-   `updateEquipment(id, data)`: valida e atualiza os dados de um
    equipamento.
-   `deleteEquipment(id)`: exclui um equipamento pelo identificador.

### Validações implementadas

-   O nome é obrigatório.
-   O endereço IP ou hostname é obrigatório.
-   O usuário é obrigatório.
-   A porta deve ser um número inteiro entre 1 e 65535.
-   Campos de texto são tratados com remoção de espaços excedentes.
-   O valor de favorito é armazenado como inteiro (`0` ou `1`).

As consultas utilizam parâmetros preparados do `better-sqlite3`,
evitando concatenar diretamente os dados recebidos nas instruções SQL.

As consultas de listagem e retorno das operações não incluem o campo
`password_encrypted`.

## 5. Comunicação IPC para equipamentos

Arquivo:

``` text
src/main/ipc/equipmentHandlers.js
```

Foram registrados os seguintes canais IPC:

  Canal                Operação
  -------------------- -----------------------
  `equipment:list`     Listar equipamentos
  `equipment:create`   Cadastrar equipamento
  `equipment:update`   Atualizar equipamento
  `equipment:delete`   Excluir equipamento

Os handlers encaminham as solicitações ao repositório no processo
principal.

## 6. API disponibilizada pelo preload

Arquivo:

``` text
src/preload/index.js
```

O preload passou a disponibilizar `window.api.equipment`, com os
métodos:

``` javascript
window.api.equipment.list()
window.api.equipment.create(data)
window.api.equipment.update(id, data)
window.api.equipment.delete(id)
```

As chamadas utilizam `ipcRenderer.invoke()`, permitindo que o renderer
solicite uma operação e receba seu resultado sem acessar diretamente o
banco de dados.

A API é exposta por meio de `contextBridge` quando o isolamento de
contexto está habilitado. O objeto `window.electron` fornecido pelo
Electron Toolkit foi mantido.

## 7. Serviço de equipamentos no renderer

Arquivo:

``` text
src/renderer/src/services/equipmentService.js
```

Foi criada uma camada de serviço para a interface React.

Ela encapsula o acesso a `window.api.equipment` e disponibiliza:

``` javascript
equipmentService.list()
equipmentService.create(data)
equipmentService.update(id, data)
equipmentService.delete(id)
```

Com isso, os componentes da interface não precisam chamar IPC
diretamente.

## 8. Página de gerenciamento de equipamentos

Arquivo:

``` text
src/renderer/src/pages/Equipamentos.jsx
```

A página provisória de equipamentos foi substituída por uma tela
funcional.

### Funcionalidades implementadas

1.  **Listagem:** exibe os equipamentos cadastrados no SQLite.
2.  **Cadastro:** abre um formulário para inserir os dados do
    equipamento.
3.  **Edição:** permite alterar os dados de um equipamento existente.
4.  **Exclusão:** solicita confirmação antes de excluir.
5.  **Pesquisa:** filtra por nome, endereço, usuário ou descrição.
6.  **Favoritos:** permite marcar e desmarcar equipamentos como
    favoritos.
7.  **Validação:** os campos obrigatórios e a porta são validados.
8.  **Estados de carregamento:** apresenta indicação enquanto os dados
    são carregados ou salvos.
9.  **Tratamento de erros:** apresenta mensagens quando uma operação
    falha.
10. **Persistência:** após as operações, a listagem é atualizada a
    partir do banco.

### Campos presentes no formulário

-   Nome do equipamento.
-   Endereço IP ou hostname.
-   Porta (padrão 8291).
-   Usuário (valor inicial sugerido: `admin`).
-   Descrição.
-   Indicador de favorito.

**Senha:** não foi incluída no formulário nesta etapa. A implementação
de credenciais será feita separadamente, após a preparação do
armazenamento seguro.

## 9. Navegação da aplicação

Arquivo alterado:

``` text
src/renderer/src/App.jsx
```

A rota `equipamentos` passou a renderizar o componente `Equipamentos`.

A navegação continua utilizando `HashRouter`, adequado ao contexto da
aplicação Electron.

As demais rotas continuam utilizando a página provisória:

-   Conexões.
-   Monitoramento.
-   Configurações.

O `MainLayout.jsx` foi mantido, preservando o layout geral, a barra
lateral, a área de conteúdo e o rodapé.

O `PlaceholderPage.jsx` também foi mantido para as áreas ainda não
implementadas.

## 10. Preparação para armazenamento seguro de credenciais

Foi iniciada a implementação da verificação de segurança do Electron por
meio de `safeStorage`.

### 10.1 Handler de segurança

Arquivo criado:

``` text
src/main/ipc/securityHandlers.js
```

O handler registra o canal:

``` text
security:status
```

Ele consulta:

-   `safeStorage.isEncryptionAvailable()`
-   `safeStorage.getSelectedStorageBackend()`

E devolve um objeto com:

-   `available`: indica se a criptografia está disponível.
-   `backend`: identifica o backend selecionado.
-   `secure`: indica se a aplicação considera o backend adequado,
    rejeitando `basic_text` e `unknown`.

### 10.2 Registro no processo principal

Arquivo alterado:

``` text
src/main/index.js
```

O handler de segurança foi registrado na inicialização da aplicação,
junto aos handlers de equipamentos e à inicialização do banco de dados.

### 10.3 API de segurança no preload

Arquivo alterado:

``` text
src/preload/index.js
```

Foi adicionada a API:

``` javascript
window.api.security.getStatus()
```

Ela consulta o canal `security:status` por meio de IPC.

### 10.4 Teste realizado

No console de desenvolvimento do Electron, foi executado:

``` javascript
await window.api.security.getStatus()
```

Resultado informado:

``` javascript
{
  available: true,
  backend: 'gnome_libsecret',
  secure: true
}
```

**Conclusão do teste:** no ambiente Linux Mint utilizado, o Electron
informou que a criptografia está disponível e selecionou o backend
`gnome_libsecret`.

Essa verificação confirma o estado do backend no ambiente testado. Ela
não significa que as senhas já estejam sendo criptografadas pelo
aplicativo.

Arquivo criado:

```text
src/main/security/credentialService.js
```

O serviço foi criado no processo principal do Electron e utiliza `safeStorage` para proteger as credenciais.

Ele contém duas funções:

- `encryptPassword(password)`: recebe uma senha e utiliza `safeStorage.encryptString()` para gerar o conteúdo criptografado.
- `decryptPassword(encryptedPassword)`: utiliza `safeStorage.decryptString()` para recuperar a senha original a partir do conteúdo criptografado.

Antes de executar as operações, o serviço verifica se a criptografia está disponível e se o backend selecionado é considerado seguro. Os backends `basic_text` e `unknown` são rejeitados.

O arquivo foi criado e a aplicação continuou iniciando e funcionando normalmente com ele presente.

**Estado atual:** o serviço de credenciais está criado. Nesta etapa, ainda não foi confirmado que a criptografia esteja integrada ao fluxo de cadastro e edição do CRUD, nem que as senhas estejam sendo gravadas e recuperadas pelo SQLite. Essa integração permanece como próxima implementação.

A função de descriptografia não deve ser disponibilizada diretamente ao renderer por IPC. O processo principal deverá recuperar a senha somente quando uma operação privilegiada, como uma conexão com o roteador, precisar dela.

## 12. Testes executados e resultados

| Teste | Resultado informado |
|---|---|
| Inicialização do SQLite | Funcionou |
| Abertura da aplicação Electron | Funcionou |
| Criação de equipamento pelo console | Funcionou |
| Listagem pelo console | Funcionou |
| Atualização pelo console | Funcionou |
| Exclusão pelo console | Funcionou |
| Cadastro pela interface | Funcionou |
| Pesquisa na interface | Funcionou |
| Edição pela interface | Funcionou |
| Exclusão pela interface | Funcionou |
| Favoritos pela interface | Funcionou |
| Persistência após reabrir a aplicação | Funcionou |
| Verificação do `safeStorage` | Funcionou |
| Backend `gnome_libsecret` | Confirmado |
| Criação de `credentialService.js` | Concluída |
| Inicialização da aplicação com `credentialService.js` presente | Funcionou |
| Criptografia integrada ao CRUD | Ainda não implementada / não validada |

A etapa visual foi concluída sem erros, e as operações persistiram corretamente no SQLite e, posteriormente, com a criação de `credentialService.js` a aplicação continuou funcionando com o arquivo presente.

## 13. Estrutura relevante dos arquivos

A estrutura relacionada às funcionalidades deste registro ficou organizada da seguinte forma:

```text
src/
├── main/
│   ├── database/
│   │   ├── connection.js
│   │   └── equipmentRepository.js
│   ├── ipc/
│   │   ├── equipmentHandlers.js
│   │   └── securityHandlers.js
│   ├── security/
│   │   └── credentialService.js
│   └── index.js
│
├── preload/
│   └── index.js
│
└── renderer/
    └── src/
        ├── services/
        │   └── equipmentService.js
        ├── components/
        │   └── ...
        ├── layouts/
        │   └── MainLayout.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Equipamentos.jsx
        │   └── PlaceholderPage.jsx
        ├── App.jsx
        └── main.jsx
```

## 14. Decisões técnicas importantes

-   O banco de dados fica no diretório `userData` do Electron, não na
    pasta de instalação.
-   O renderer não acessa SQLite diretamente.
-   As consultas SQL ficam concentradas no repositório.
-   A comunicação entre renderer e main é feita por uma API restrita no
    preload e por IPC.
-   Senhas não devem ser armazenadas em texto puro.
-   O campo `password_encrypted` foi reservado no schema desde a criação
    da tabela.
-   O `safeStorage` será utilizado para criptografar e descriptografar
    credenciais no processo principal.
-   A disponibilidade e o backend de criptografia devem ser verificados
    antes de armazenar credenciais.
-   O projeto deve continuar considerando Windows e Linux. Módulos
    nativos, como `better-sqlite3`, precisam ser preparados/buildados
    para cada plataforma de destino.

## 15. Próximas etapas recomendadas

### Etapa imediata --- concluir o armazenamento seguro

1.  Criar e testar `src/main/security/credentialService.js`.
2.  Integrar a criptografia ao `equipmentRepository.js`.
3.  Ajustar os handlers IPC para receber a senha sem retorná-la nas
    respostas.
4.  Adicionar o campo de senha ao formulário.
5.  Garantir que uma edição com o campo de senha vazio preserve a senha
    já armazenada.
6.  Criar uma operação específica e restrita para uso futuro das
    credenciais no processo principal.
7.  Testar gravação, preservação e recuperação de credenciais.

### Etapas posteriores

1.  Implementar teste de conectividade e latência (ping).
2.  Exibir status online/offline na listagem.
3.  Integrar a abertura do WinBox nativo.
4.  Alimentar o Dashboard com dados reais do SQLite.
5.  Desenvolver a área de conexões.
6.  Integrar a API RouterOS.
7.  Evoluir para monitoramento e alertas.
8.  Planejar integração com VPS, API e PostgreSQL.

------------------------------------------------------------------------

## 16. Sugestão de commit Git

O commit abaixo descreve o que foi efetivamente implementado e testado
nesta etapa. Ele não afirma que a criptografia das senhas já esteja
integrada.

**Título:**

``` text
feat: implementa gerenciamento de equipamentos com SQLite
```

**Descrição:**

``` text
Implementa o CRUD completo de equipamentos com persistência local em SQLite.

- Cria conexão SQLite usando better-sqlite3.
- Armazena o banco no diretório userData do Electron.
- Cria tabela de equipamentos e campo reservado para credenciais criptografadas.
- Implementa repositório com operações de criação, listagem, edição e exclusão.
- Adiciona validações para os dados dos equipamentos.
- Registra handlers IPC para as operações de equipamentos.
- Expõe API restrita pelo preload.
- Cria serviço de equipamentos no renderer.
- Implementa tela de equipamentos com cadastro, edição e exclusão.
- Adiciona pesquisa e gerenciamento de favoritos.
- Mantém a navegação com HashRouter e as páginas provisórias existentes.
- Adiciona verificação de disponibilidade do safeStorage.
- Confirma backend gnome_libsecret no ambiente Linux Mint.
- Valida as operações do CRUD no console e na interface.
```

Comando:

``` bash
git add .
git commit \
  -m "feat: implementa gerenciamento de equipamentos com SQLite" \
  -m "Implementa CRUD completo de equipamentos com persistência local." \
  -m "Adiciona repositório SQLite, handlers IPC e API restrita no preload." \
  -m "Cria interface de cadastro, edição, exclusão, pesquisa e favoritos." \
  -m "Adiciona verificação do safeStorage e confirma backend gnome_libsecret." \
  -m "Valida operações do CRUD e persistência no Linux Mint."
```

Antes de executar, confira `git status` e revise as alterações para
garantir que arquivos temporários, credenciais ou outros arquivos
indevidos não sejam incluídos. O comando cria o commit localmente; ele
não faz `push` para um repositório remoto.

------------------------------------------------------------------------

**Estado geral:** o gerenciamento local de equipamentos está
implementado e validado. A verificação do backend seguro também está
funcionando. O próximo marco é concluir a criptografia e o ciclo de vida
das credenciais, antes de utilizar senhas reais para conexões com
roteadores.
