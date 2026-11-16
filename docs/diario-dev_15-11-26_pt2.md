# MikroTik Manager --- Diário de desenvolvimento (15/11/2026 --- Parte 2)

> **Continuação de:** `diario-dev_15-11-26.md`\
> **Data:** 15/11/2026\
> **Escopo deste registro:** implementação dos testes de conectividade,
> monitoramento coletivo e página Conexões, além dos ajustes finais de
> experiência de uso realizados depois do ponto de encerramento do
> diário anterior.

Este documento é **incremental**. Ele começa exatamente após o
encerramento do `diario-dev_15-11-26.md` e registra somente o trabalho
adicional desta continuação. Não repete o histórico de criação do
projeto, CRUD, SQLite ou preparação inicial do `safeStorage`, que já
estão documentados na Parte 1.

------------------------------------------------------------------------

## 1. Ponto de partida

Ao final do diário anterior, o projeto já possuía:

-   CRUD de equipamentos integrado ao SQLite;
-   página Equipamentos funcional;
-   comunicação entre renderer, preload, IPC e processo principal;
-   serviço `credentialService.js` criado;
-   verificação de disponibilidade do `safeStorage` no Linux Mint.

A próxima etapa prevista era concluir a integração das credenciais e
avançar para testes de conectividade.

Nesta continuação, a implementação avançou para a conectividade e para a
visualização dos equipamentos monitorados. O ciclo de conexão com o
WinBox nativo ainda não foi implementado.

------------------------------------------------------------------------

## 2. Serviço de conectividade --- ping e porta TCP

Foi criado o serviço:

``` text
src/main/services/connectivityService.js
```

Ele executa dois testes independentes para um equipamento:

1.  **ICMP ping:** verifica se o endereço responde e tenta obter a
    latência.
2.  **TCP:** tenta abrir uma conexão com a porta cadastrada do
    equipamento, normalmente 8291 (WinBox).

### Tecnologias utilizadas

-   `child_process.execFile`: executa o comando `ping` do sistema
    operacional, sem utilizar shell intermediário.
-   `net.Socket`: realiza a tentativa de conexão TCP.
-   `Promise.all`: permite executar o ping e o teste TCP do mesmo
    equipamento em paralelo.

### Timeouts iniciais

  Verificação      Timeout
  ------------- ----------
  Ping            2.000 ms
  TCP             1.500 ms

O comando de ping utiliza argumentos específicos conforme o sistema
operacional, contemplando Linux, macOS e Windows.

### Resultado retornado

A função `checkEquipmentConnectivity(host, port)` retorna um objeto com:

-   host consultado;
-   horário da verificação;
-   resultado do ping;
-   latência em milissegundos, quando disponível;
-   porta TCP consultada;
-   indicação se a porta está aberta.

O serviço valida o endereço e a porta antes de executar os testes.

------------------------------------------------------------------------

## 3. Integração IPC e API do preload

Foi criado o handler:

``` text
src/main/ipc/connectivityHandlers.js
```

Ele registra a operação de verificação de conectividade no processo
principal do Electron.

O handler foi registrado em:

``` text
src/main/index.js
```

A API correspondente foi disponibilizada no preload:

``` text
src/preload/index.js
```

Chamada utilizada para testar um equipamento individualmente:

``` javascript
await window.api.connectivity.check({
  host: '10.10.0.2',
  port: 8291
})
```

### Teste individual realizado

O usuário executou a chamada com o endereço `10.10.0.2`.

Resultado observado:

``` javascript
{
  host: '10.10.0.2',
  checkedAt: '2026-11-15T21:19:34.999Z',
  ping: {
    online: true,
    latencyMs: 442
  },
  winbox: {
    port: 8291,
    open: true
  }
}
```

**Conclusão:** o ping respondeu e a porta TCP 8291 estava aberta. O
teste individual foi confirmado como funcional.

### Contexto da latência

A latência observada, na faixa de centenas de milissegundos, foi
considerada coerente com o ambiente de teste daquele momento:

-   VPS WireGuard localizada em New Jersey, Estados Unidos;
-   notebook conectado por Wi-Fi e distante do modem.

Foi considerada a possibilidade de futuramente utilizar uma VPS em São
Paulo e comparar os resultados. Os valores observados são específicos do
caminho de rede e das condições daquele teste.

------------------------------------------------------------------------

## 4. Verificação coletiva dos equipamentos

A implementação foi ampliada para verificar os equipamentos cadastrados
sem exigir uma chamada manual para cada roteador.

A verificação coletiva consulta os registros existentes e executa os
testes de conectividade para cada equipamento.

Foi adotado um limite inicial de concorrência de **dez equipamentos
simultâneos**, evitando disparar verificações ilimitadas de uma só vez.

A API de verificação coletiva disponibilizada no preload é:

``` javascript
window.api.connectivity.checkAll()
```

### Teste coletivo

Foi executado no console do Electron:

``` javascript
const results = await window.api.connectivity.checkAll()

console.table(
  results.map(e => ({
    id: e.id,
    equipamento: e.name,
    host: e.host,
    ping: e.ping.online ? 'ONLINE' : 'SEM RESPOSTA',
    latencia: e.ping.latencyMs,
    winbox: e.winbox.open ? 'ABERTA' : 'FECHADA'
  }))
)
```

Na primeira validação coletiva, seis equipamentos cadastrados foram
apresentados na tabela.

O usuário confirmou que:

-   os dois equipamentos acessíveis apareciam com ping respondendo;
-   a porta WinBox dos dois equipamentos acessíveis aparecia aberta;
-   os outros quatro equipamentos apareciam sem resposta nos testes.

Os resultados correspondiam à situação real dos equipamentos utilizados
no teste.

### Considerações sobre carga

O monitoramento executa verificações curtas de ICMP e TCP. O limite de
concorrência foi adotado para controlar a quantidade de operações
simultâneas.

A meta do projeto é suportar ambientes com dezenas de roteadores,
possivelmente 80 ou mais. O desempenho deverá ser validado com uma lista
maior e em condições reais de rede antes de considerar a escala
comprovada.

Um equipamento que não responde ao ping não deve ser automaticamente
considerado inacessível: o ICMP pode estar bloqueado enquanto a porta
TCP do WinBox continua disponível.

------------------------------------------------------------------------

## 5. Nova página Conexões

Foi criada a página:

``` text
src/renderer/src/pages/Conexoes.jsx
```

A rota `conexoes` em:

``` text
src/renderer/src/App.jsx
```

passou a renderizar essa página no lugar do placeholder.

A página utiliza os equipamentos já cadastrados no SQLite. **Não existe
um segundo cadastro de roteadores:** Equipamentos continua sendo a fonte
única dos registros, e Conexões apresenta o estado de acessibilidade
desses mesmos itens.

### 5.1 Indicadores superiores

A interface apresenta três cartões:

-   Total de equipamentos;
-   Online;
-   Offline.

Os indicadores representam o conjunto total de equipamentos cadastrados,
e não apenas os resultados que eventualmente estejam visíveis após uma
pesquisa.

### 5.2 Critério de disponibilidade

A regra adotada é:

-   **ONLINE:** ping responde **ou** a porta TCP do WinBox está aberta.
-   **OFFLINE:** ping não responde **e** a porta TCP está fechada.

Essa regra evita classificar incorretamente um MikroTik que bloqueia
ICMP, mas aceita conexão WinBox.

A interface também apresenta separadamente o resultado do ping e o
estado da porta TCP, para que o operador entenda por que um equipamento
está acessível ou não.

### 5.3 Cards dos equipamentos

Cada card apresenta:

-   Nome do equipamento;
-   IP ou hostname;
-   Estado ONLINE/OFFLINE;
-   Latência do ping;
-   Estado da porta WinBox;
-   Horário da última verificação;
-   Botão **Conectar**.

O botão Conectar está presente visualmente, mas ainda não executa a
abertura do WinBox nativo. Essa integração permanece como próxima
funcionalidade.

### 5.4 Atualização manual e automática

A página oferece o botão **Atualizar agora** e realiza atualização
automática a cada 30 segundos.

O intervalo inicial utilizado é:

``` javascript
const REFRESH_INTERVAL = 30000
```

Foi incluída proteção para evitar que uma nova rodada de monitoramento
seja iniciada enquanto a anterior ainda estiver em execução.

O intervalo é limpo quando a página é desmontada. Portanto, o
monitoramento atual funciona enquanto a página Conexões está aberta; ele
ainda não é um serviço global em segundo plano.

------------------------------------------------------------------------

## 6. Validação funcional da página Conexões

O usuário realizou os testes solicitados e confirmou os seis itens:

  Teste                                                  Resultado
  ------------------------------------------------------ -----------
  Os equipamentos cadastrados aparecem                   OK
  Os dois MikroTiks acessíveis aparecem ONLINE           OK
  Os demais equipamentos sem resposta aparecem OFFLINE   OK
  Latência e porta WinBox correspondem aos testes        OK
  Botão Atualizar agora funciona                         OK
  Atualização automática após 30 segundos funciona       OK

A página foi considerada visualmente satisfatória pelo usuário.

Em uma captura posterior, a interface apresentava sete equipamentos no
total, dois online e cinco offline. Essa contagem é o estado exibido
naquela captura, diferente da primeira tabela de teste coletivo, que
continha seis registros.

------------------------------------------------------------------------

## 7. Melhorias de experiência de uso (UX)

Após validar o funcionamento, foram solicitados três ajustes:

1.  Barra de pesquisa na página Conexões;
2.  Sidebar fixa, sem crescer junto com o conteúdo;
3.  Barra de rolagem visualmente mais discreta.

### 7.1 Pesquisa na página Conexões

Foi adicionada uma barra de pesquisa seguindo o padrão visual da página
Equipamentos:

-   ícone de lupa;
-   campo com fundo escuro;
-   borda discreta;
-   destaque de borda ao receber foco.

A pesquisa filtra os cards por nome ou IP/hostname.

Os indicadores superiores continuam apresentando os totais gerais, mesmo
quando existe um filtro ativo.

### 7.2 Sidebar fixa e rolagem independente

Arquivo alterado:

``` text
src/renderer/src/layouts/MainLayout.jsx
```

O contêiner principal foi ajustado para ocupar a altura da janela e
impedir que o layout inteiro cresça verticalmente:

``` jsx
<div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
```

A área de conteúdo principal passou a ter altura definida e rolagem
própria:

``` jsx
<main className="h-screen min-w-0 flex-1 overflow-y-auto p-8">
```

Objetivo do ajuste:

-   Sidebar permanece ocupando a altura da janela;
-   Sidebar não acompanha o crescimento vertical da página;
-   a rolagem ocorre na área de conteúdo;
-   o rodapé permanece no fluxo do conteúdo principal.

### 7.3 Scrollbar personalizada

Arquivo alterado:

``` text
src/renderer/src/assets/main.css
```

Foi adicionada uma personalização global da scrollbar:

-   largura reduzida;
-   trilho em tom escuro;
-   indicador em tons slate;
-   cantos arredondados;
-   alteração de tonalidade ao passar o cursor.

Foram utilizadas propriedades padrão de scrollbar e seletores WebKit
para melhorar a aparência nos ambientes compatíveis.

------------------------------------------------------------------------

## 8. Estado visual ao final desta etapa

A captura de tela apresentada pelo usuário mostrou a página Conexões
com:

-   Sidebar à esquerda;
-   tema escuro preservado;
-   fonte Poppins;
-   indicadores de equipamentos, online e offline;
-   botão Atualizar agora;
-   campo de pesquisa;
-   cards em duas colunas;
-   latência e porta WinBox exibidas em cada card;
-   botão Conectar;
-   rolagem vertical na área de conteúdo.

O usuário aprovou o resultado visual e informou que as funcionalidades
implementadas até então estavam funcionando corretamente.

------------------------------------------------------------------------

## 9. Arquivos criados ou alterados nesta Parte 2

### Processo principal

``` text
src/main/services/connectivityService.js
src/main/ipc/connectivityHandlers.js
src/main/index.js
```

### Preload

``` text
src/preload/index.js
```

### Renderer

``` text
src/renderer/src/App.jsx
src/renderer/src/pages/Conexoes.jsx
src/renderer/src/layouts/MainLayout.jsx
src/renderer/src/assets/main.css
```

O arquivo `Equipamentos.jsx` e o repositório SQLite continuam sendo
utilizados como fonte dos registros, sem duplicação de cadastro.

------------------------------------------------------------------------

## 10. Decisões e limites técnicos registrados

1.  A página Equipamentos continua responsável pelo CRUD; Conexões não
    cria registros próprios.
2.  O Manager pressupõe que a conectividade IP já exista. Não configura
    nem gerencia WireGuard.
3.  O monitoramento atual utiliza ping e TCP WinBox.
4.  A porta TCP consultada é a porta cadastrada para o equipamento, com
    padrão 8291.
5.  Um ping sem resposta não significa necessariamente que o roteador
    esteja desligado.
6.  A condição ONLINE considera sucesso em pelo menos um dos testes:
    ICMP ou TCP.
7.  A verificação coletiva possui limite inicial de dez equipamentos
    simultâneos.
8.  A atualização automática ocorre a cada 30 segundos enquanto a página
    Conexões está montada.
9.  Uma rodada não deve sobrepor outra.
10. O botão Conectar ainda não abre o WinBox.
11. O monitoramento ainda não mantém histórico persistente de
    disponibilidade.
12. A meta de 80 ou mais equipamentos ainda precisa ser validada em
    teste de escala.

------------------------------------------------------------------------

## 11. Checklist desta continuação

### Conectividade

-   [x] Criar serviço de conectividade no processo principal.
-   [x] Implementar ping ICMP.
-   [x] Obter latência quando disponível.
-   [x] Implementar teste TCP da porta WinBox.
-   [x] Validar host e porta.
-   [x] Criar handler IPC de conectividade.
-   [x] Expor a API no preload.
-   [x] Testar um equipamento real acessível.

### Monitoramento coletivo

-   [x] Consultar os equipamentos cadastrados.
-   [x] Verificar os equipamentos coletivamente.
-   [x] Limitar a concorrência a dez equipamentos.
-   [x] Conferir resultados de ping e TCP.
-   [x] Validar os resultados com equipamentos reais/de teste.

### Página Conexões

-   [x] Criar a página Conexões.
-   [x] Integrar a rota no App.
-   [x] Exibir indicadores gerais.
-   [x] Exibir cards individuais.
-   [x] Diferenciar ONLINE e OFFLINE.
-   [x] Mostrar latência e estado da porta WinBox.
-   [x] Implementar atualização manual.
-   [x] Implementar atualização automática de 30 segundos.
-   [x] Evitar rodadas sobrepostas.
-   [x] Limpar o intervalo ao desmontar a página.

### UX

-   [x] Adicionar pesquisa por nome e IP.
-   [x] Manter indicadores com totais gerais durante a pesquisa.
-   [x] Fixar a altura do layout e permitir rolagem independente no
    conteúdo.
-   [x] Personalizar a scrollbar.
-   [x] Validar visualmente a página com o usuário.

------------------------------------------------------------------------

## 12. Próxima etapa recomendada

O próximo marco é implementar a ação real do botão **Conectar**, abrindo
o WinBox nativo com o endereço e a porta do equipamento selecionado.

Sequência sugerida:

1.  Verificar como o WinBox está instalado no Linux Mint e como pode ser
    chamado pelo terminal.
2.  Testar manualmente a abertura do WinBox com IP e porta.
3.  Implementar a chamada no processo principal do Electron, por meio de
    um handler IPC específico.
4.  Expor somente uma operação controlada pelo preload, sem permitir
    execução arbitrária de comandos pelo renderer.
5.  Planejar a compatibilidade com Windows.
6.  Testar com equipamentos acessíveis pela rede já existente.
7.  Avaliar posteriormente se a credencial criptografada será necessária
    para alguma etapa da conexão, mantendo a senha fora do renderer.

A integração deve funcionar sobre as rotas de rede/VPN que já estiverem
configuradas no computador.

------------------------------------------------------------------------

**Ponto exato de parada:** a página Conexões está implementada e
validada, com pesquisa, cards, indicadores, testes de ping e TCP,
atualização manual e automática e ajustes de UX. O cadastro de
equipamentos e a persistência continuam sendo os implementados na
Parte 1. A próxima funcionalidade a desenvolver é a abertura do WinBox
nativo pelo botão Conectar.

------------------------------------------------------------------------

**Encerramento:** esta Parte 2 registra exclusivamente a continuação do
trabalho após o ponto final do `diario-dev_15-11-26.md`. O
desenvolvimento foi pausado aqui, antes de iniciar a integração com o
WinBox.
