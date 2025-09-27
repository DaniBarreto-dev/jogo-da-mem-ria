Claro! Aqui está uma versão formatada e organizada do seu texto de documentação para o projeto do **Jogo da Memória – Harry Potter & Percy Jackson**, para melhor leitura e apresentação:

---

# Documentação – Jogo da Memória HP & PJ

---

## 1. Visão Geral

O **Jogo da Memória – Harry Potter & Percy Jackson** é um projeto interativo desenvolvido com **HTML, CSS e JavaScript puro**.  
Permite que 1 ou 2 jogadores testem sua memória encontrando pares de cartas com ícones e rótulos temáticos das duas franquias.  
O jogo é totalmente responsivo e acessível pelo teclado.

---

## 2. Tecnologias e Estrutura

- **HTML:** Define a estrutura da página, incluindo cabeçalho, painel de controle, tabuleiro, barra de pontuação, sidebar e template das cartas.  
- **CSS:** Define cores, variáveis de tema, layout, responsividade e animações de flip (virar carta).  
- **JavaScript:** Controla o estado do jogo (modo, dificuldade, tema, pontuação), constrói o baralho, renderiza cartas e gerencia interações do usuário.

---

## 3. Funcionalidades

### 3.1 Modos de Jogo
- **Solo:** Um único jogador com pontuação única.  
- **Duo (2 Jogadores):** Cada jogador possui sua própria pontuação e pares; o jogo alterna automaticamente entre os turnos.

### 3.2 Dificuldade
- **Fácil (4×4):** 8 pares.  
- **Médio (5×4):** 10 pares.  
- **Difícil (6×4):** 12 pares.

### 3.3 Temas
- HP + PJ (misto)  
- Somente Harry Potter  
- Somente Percy Jackson

### 3.4 Sistema de Pontuação
- Cronômetro em tempo real.  
- Contador de movimentos.  
- Pontos calculados com base no tempo, número de movimentos e sequência de acertos.  
- Ranking por jogador no modo 2 jogadores.

### 3.5 Acessibilidade
- Totalmente navegável via teclado (TAB para navegar, ENTER ou ESPAÇO para virar a carta).  
- Anúncio de status (mensagens ao vivo) para leitores de tela.

---

## 4. Organização do Código

### 4.1 HTML
- `header`: título do jogo e badge “HTML • CSS • JS”.  
- `section.panel controls`: seleção de modo, dificuldade e tema + botões “Novo jogo” e “Reiniciar”.  
- `section.panel`: barra de status (tempo, movimentos, pontos, mensagem).  
- `section.boardWrap`: contém `aside.sidebar` (pontuação por jogador + legenda) e `div.board` (tabuleiro).  
- `template#cardTemplate`: modelo de carta para clonagem via JavaScript.  
- `footer`: instruções rápidas.

### 4.2 CSS
- Variáveis no `:root` para cores, gradientes e sombras.  
- Layout em grid para painel, tabuleiro e sidebar.  
- Estilização das cartas com classes `.card`, `.inner`, `.face` usando transform 3D para animação de flip.  
- Responsividade com media queries para telas menores.

### 4.3 JavaScript
- Dividido em blocos comentados para melhor organização:  
  - **DATA:** arrays HP e PJ com ícones, rótulos e franquia.  
  - **STATE:** objeto central com estado do jogo (modo, dificuldade, tema, pontuação, jogadores etc).  
  - **HELPERS:** funções utilitárias como shuffle, formatTime, calcScore, etc.  
  - **BUILD DECK:** montagem do baralho conforme tema e dificuldade.  
  - **RENDER:** funções renderLegend (mostra legenda lateral) e renderBoard (insere cartas no DOM).  
  - **GAMEFLOW:** funções flipCard (vira carta, compara par, calcula pontuação), checkEnd (verifica fim do jogo), resetRound (reinicia rodada), applyDifficulty (ajusta colunas).  
  - **UI BINDINGS:** conecta botões e chips ao estado do jogo.  
  - **A11y:** foco automático na primeira carta após iniciar novo jogo.

---

## 5. Fluxo do Jogo

1. Jogador escolhe modo, dificuldade e tema.  
2. Clica em **Novo jogo**: o baralho é construído e as cartas são renderizadas.  
3. Ao clicar ou pressionar uma carta, ela vira.  
4. Quando duas cartas são viradas, o JavaScript verifica se formam um par:  
   - Se **sim**: cartas permanecem viradas, pontos são adicionados e pares contabilizados.  
   - Se **não**: cartas viram para baixo após um delay e, no modo 2 jogadores, ocorre troca de turno.  
5. HUD (tempo, movimentos, pontos) é atualizado em tempo real.  
6. Ao encontrar todos os pares, o cronômetro para e é exibida uma mensagem final com o vencedor ou empate.

---

## 6. Manutenção e Extensão

- Para adicionar novas cartas: inserir objetos nos arrays HP ou PJ.  
- Para alterar a pontuação: ajustar a lógica da função `calcScore`.  
- Para modificar o estilo: editar as variáveis CSS no `:root`.  
- Para internacionalização: trocar labels/emoji diretamente nos arrays ou no HTML.

---
