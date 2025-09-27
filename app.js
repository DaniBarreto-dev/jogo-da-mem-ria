
    // ======= DATA =======
    const HP = [
      { key:'hp_lightning', label:'Relâmpago', emoji:'⚡️', franchise:'Harry Potter' },
      { key:'hp_snitch',    label:'Pomo de Ouro', emoji:'🪙', franchise:'Harry Potter' },
      { key:'hp_broom',     label:'Vassoura', emoji:'🧹', franchise:'Harry Potter' },
      { key:'hp_hat',       label:'Chapéu Seletor', emoji:'🎩', franchise:'Harry Potter' },
      { key:'hp_owl',       label:'Coruja', emoji:'🦉', franchise:'Harry Potter' },
      { key:'hp_wand',      label:'Varinha', emoji:'🪄', franchise:'Harry Potter' },
      { key:'hp_potion',    label:'Poção', emoji:'🧪', franchise:'Harry Potter' },
      { key:'hp_book',      label:'Livro de Magia', emoji:'📖', franchise:'Harry Potter' },
    ];
    const PJ = [
      { key:'pj_trident',   label:'Tridente', emoji:'🔱', franchise:'Percy Jackson' },
      { key:'pj_wave',      label:'Onda', emoji:'🌊', franchise:'Percy Jackson' },
      { key:'pj_pegasus',   label:'Pégaso', emoji:'🐎', franchise:'Percy Jackson' },
      { key:'pj_sword',     label:'Espada', emoji:'🗡️', franchise:'Percy Jackson' },
      { key:'pj_shell',     label:'Concha', emoji:'🐚', franchise:'Percy Jackson' },
      { key:'pj_map',       label:'Mapa', emoji:'🗺️', franchise:'Percy Jackson' },
      { key:'pj_tower',     label:'Monte Olimpo', emoji:'🏛️', franchise:'Percy Jackson' },
      { key:'pj_shield',    label:'Escudo', emoji:'🛡️', franchise:'Percy Jackson' },
    ];

    // ======= STATE =======
    const state = {
      mode: 'solo', // 'solo' | 'duo'
      difficulty: 'easy', // easy(4x4), medium(5x4), hard(6x4)
      theme: 'mix', // mix | hp | pj
      cols: 4,
      rows: 4,
      deck: [],
      flipped: [],
      lock: false,
      moves: 0,
      startTime: null,
      timerId: null,
      points: 0,
      pairsFound: 0,
      totalPairs: 0,
      currentPlayer: 1,
      players: {
        1: { points:0, pairs:0 },
        2: { points:0, pairs:0 },
      }
    }

    // ======= HELPERS =======
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    const pad = n => String(n).padStart(2,'0');

    function shuffle(arr){
      const a = [...arr];
      for(let i=a.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [a[i],a[j]] = [a[j],a[i]];
      }
      return a;
    }

    function timeNow(){ return Date.now() }

    function formatTime(ms){
      const s = Math.floor(ms/1000);
      const m = Math.floor(s/60);
      const r = s%60; return `${pad(m)}:${pad(r)}`;
    }

    function calcScore(deltaMs, moves, pairsFound, isMatch){
      // base decai com o tempo e movimentos; bônus por acerto em sequência
      const base = 1000 - Math.floor(deltaMs/1000)*2 - moves*3;
      const bonus = isMatch ? 25 + pairsFound*2 : 0;
      return Math.max(0, base + bonus);
    }

    function setStatus(msg){ $('#status').textContent = msg }

    function updateHud(){
      const elapsed = state.startTime ? timeNow() - state.startTime : 0;
      $('#time').textContent = formatTime(elapsed);
      $('#moves').textContent = state.moves;
      $('#points').textContent = state.points;
      $('#p1score').textContent = state.players[1].points;
      $('#p2score').textContent = state.players[2].points;
      $('#p1pairs').textContent = state.players[1].pairs;
      $('#p2pairs').textContent = state.players[2].pairs;
      $('#p1box').classList.toggle('active', state.currentPlayer===1 && state.mode==='duo');
      $('#p2box').classList.toggle('active', state.currentPlayer===2 && state.mode==='duo');
    }

    function startTimer(){
      if(state.timerId) clearInterval(state.timerId);
      state.startTime = timeNow();
      state.timerId = setInterval(updateHud, 500);
    }

    function stopTimer(){
      if(state.timerId){ clearInterval(state.timerId); state.timerId=null; }
      updateHud();
    }

    // ======= BUILD DECK =======
    function buildDeck(){
      const pool = state.theme==='hp' ? HP : state.theme==='pj' ? PJ : [...HP, ...PJ];
      let pairCount = state.cols*state.rows/2;
      const chosen = shuffle(pool).slice(0, pairCount);
      const deck = shuffle(chosen.flatMap((c,idx)=>[
        { ...c, uid:`${c.key}_A_${idx}` },
        { ...c, uid:`${c.key}_B_${idx}` },
      ]));
      state.deck = deck; state.totalPairs = pairCount;
    }

    // ======= RENDER =======
    function renderLegend(){
      const unique = {};
      state.deck.forEach(c=> unique[c.key] = c);
      const el = $('#legend');
      el.innerHTML = '';
      Object.values(unique).slice(0,12).forEach(c=>{
        const d = document.createElement('div');
        d.className = 'chip';
        d.innerHTML = `${c.emoji} ${c.label}`;
        el.appendChild(d);
      })
    }

    function renderBoard(){
      const board = $('#board');
      board.style.setProperty('--cols', state.cols);
      board.innerHTML = '';
      const tpl = $('#cardTemplate');
      state.deck.forEach((card, idx)=>{
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.id = card.uid;
        node.querySelector('.emoji').textContent = card.emoji;
        node.querySelector('.label').textContent = card.label;
        node.querySelector('.franchise').textContent = card.franchise;
        const btn = node.querySelector('button');
        btn.setAttribute('aria-label', `Carta: ${card.label} de ${card.franchise}`);
        btn.addEventListener('click', ()=> flipCard(node, card));
        btn.addEventListener('keydown', (e)=>{
          if(e.key==='Enter' || e.key===' '){ e.preventDefault(); flipCard(node, card); }
        });
        board.appendChild(node);
      });
    }

    // ======= GAMEFLOW =======
    function flipCard(node, card){
      if(state.lock) return;
      if(node.dataset.state==='matched' || node.dataset.state==='flipped') return;

      node.dataset.state = 'flipped';
      state.flipped.push({node, card});

      if(state.flipped.length===2){
        state.lock = true; state.moves++;
        const [a,b] = state.flipped;
        const isMatch = a.card.key === b.card.key;
        const elapsed = timeNow() - state.startTime;
        const scoreDelta = calcScore(elapsed, state.moves, state.pairsFound, isMatch);

        if(isMatch){
          a.node.dataset.state = 'matched';
          b.node.dataset.state = 'matched';
          state.pairsFound++;
          state.points += scoreDelta;
          if(state.mode==='duo'){
            state.players[state.currentPlayer].points += scoreDelta;
            state.players[state.currentPlayer].pairs++;
          }
          setStatus('Par encontrado! Continue…');
          state.lock = false; state.flipped = [];
          updateHud();
          checkEnd();
        } else {
          setStatus('Não foi par. Tente novamente.');
          if(state.mode==='duo') state.currentPlayer = state.currentPlayer===1 ? 2 : 1;
          updateHud();
          setTimeout(()=>{
            a.node.dataset.state='hidden'; b.node.dataset.state='hidden';
            state.lock=false; state.flipped=[];
          }, 700);
        }
      }
      updateHud();
    }

    function checkEnd(){
      if(state.pairsFound === state.totalPairs){
        stopTimer();
        const t = timeNow()-state.startTime;
        let msg = `Concluído em ${formatTime(t)} com ${state.moves} movimentos. Pontuação: ${state.points}.`;
        if(state.mode==='duo'){
          const p1 = state.players[1].points; const p2 = state.players[2].points;
          msg += p1===p2 ? ' Empate!' : ` Vencedor: ${p1>p2 ? 'Jogador 1' : 'Jogador 2'}!`;
        }
        setStatus(msg);
      }
    }

    function resetRound(){
      state.flipped=[]; state.lock=false; state.moves=0; state.points=0; state.pairsFound=0; state.currentPlayer=1;
      state.players = { 1:{points:0,pairs:0}, 2:{points:0,pairs:0} };
      startTimer(); updateHud();
      buildDeck(); renderLegend(); renderBoard();
      setStatus('Boa partida!');
    }

    function applyDifficulty(){
      const map = { easy:[4,4], medium:[5,4], hard:[6,4] };
      [state.cols,state.rows] = map[state.difficulty];
      $('#board').style.setProperty('--cols', state.cols);
    }

    function initFromUI(){
      applyDifficulty(); resetRound();
    }

    // ======= UI BINDINGS =======
    function setupSegmentedControls(){
      $$('.chip[data-seg]').forEach(btn=>{
        const group = btn.dataset.seg;
        const value = btn.dataset.value;
        btn.addEventListener('click',()=>{
          $$(`.chip[data-seg="${group}"]`).forEach(b=> b.setAttribute('data-selected','false'));
          btn.setAttribute('data-selected','true');
          $$(`.chip[data-seg="${group}"]`).forEach(b=> b.setAttribute('aria-pressed','false'));
          btn.setAttribute('aria-pressed','true');
          state[group] = value; // mode | difficulty | theme
          if(group==='difficulty') applyDifficulty();
        });
        // default selections
        const isDefault = btn.getAttribute('aria-pressed')==='true';
        btn.setAttribute('data-selected', isDefault ? 'true' : 'false');
      })
    }

    document.getElementById('newGame').addEventListener('click', initFromUI);
    document.getElementById('reset').addEventListener('click', resetRound);

    setupSegmentedControls();
    initFromUI();

    // ======= A11y: foco inicial na board após novo jogo =======
    const board = document.getElementById('board');
    const observer = new MutationObserver(()=>{
      const firstBtn = board.querySelector('button');
      if(firstBtn) firstBtn.focus({preventScroll:true});
    });
    observer.observe(board, { childList:true });
