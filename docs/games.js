// ============================================================
// GAMES DATA
// ============================================================
var GAMES = [
  { id:'rps',     name:'RO SHAM BO',    icon:'✊', tag:'CLASSIC',  desc:'Best-of-5 Rock Paper Scissors against the computer. Simple, satisfying, ruthless.',             lsKey:'arcade_rps_best' },
  { id:'guess',   name:'NUMBER GUESS',  icon:'🎯', tag:'PUZZLE',   desc:'I\'m thinking of a number between 1 and 100. Guess it in as few tries as possible.',           lsKey:'arcade_guess_best' },
  { id:'memory',  name:'MEMORY MATCH',  icon:'🃏', tag:'BRAIN',    desc:'Flip cards and find matching pairs. Choose 4×4 Easy or 6×6 Hard mode.',                        lsKey:'arcade_memory_easy_best' },
  { id:'clicker', name:'COIN CLICKER',  icon:'💰', tag:'IDLE',     desc:'Click coins, buy upgrades, prestige for multipliers. How high can you go?',                     lsKey:'arcade_clicker_save' },
  { id:'reflex',  name:'SPEED TEST',    icon:'⚡', tag:'REFLEX',   desc:'Wait for green, then click as fast as you can. Under 200ms is inhuman territory.',              lsKey:'arcade_reflex_best' },
  { id:'snake',   name:'SNAKE',         icon:'🐍', tag:'ARCADE',   desc:'Classic snake with neon visuals. Use arrow keys or WASD. Speed increases every 5 points.',      lsKey:'arcade_snake_best' },
  { id:'ttt',     name:'TIC-TAC-TOE',   icon:'⭕', tag:'CLASSIC',  desc:'Three in a row wins. Can you beat the CPU? Build your win streak.',                             lsKey:'arcade_ttt_best' },
  { id:'scramble',name:'WORD SCRAMBLE', icon:'🔤', tag:'WORD',     desc:'Unscramble 10 words before time runs out. 30 seconds per word — fast fingers win.',             lsKey:'arcade_scramble_best' },
  { id:'mole',    name:'WHACK-A-MOLE',  icon:'🔨', tag:'ACTION',   desc:'Moles pop up, you smash them. 30 seconds on the clock. How many can you hit?',                 lsKey:'arcade_mole_best' },
  { id:'math',    name:'MATH BLASTER',  icon:'🧮', tag:'BRAIN',    desc:'Answer math equations as fast as you can in 60 seconds. Difficulty ramps up as you score.',    lsKey:'arcade_math_best' },
];

// ============================================================
// GAME CLEANUP SYSTEM
// ============================================================
var activeCleanup = null;

function stopAllGames() {
  if (activeCleanup) { activeCleanup(); activeCleanup = null; }
}

function setCleanup(fn) { activeCleanup = fn; }

// ============================================================
// GAMES PAGE ROUTER
// ============================================================
function getScore(key) {
  var v = localStorage.getItem(key);
  if (!v) return null;
  try {
    var p = JSON.parse(v);
    return typeof p === 'object' ? (p.coins != null ? p.coins : (p.best != null ? p.best : null)) : (Number(v) || null);
  } catch(e) { return Number(v) || null; }
}

function renderGames(app) {
  app.innerHTML = '\n  <div class="container">\n    <div class="games-header">\n      <p class="section-label" style="justify-content:center">Arcade Cabinet</p>\n      <h1 class="section-title" style="text-align:center;font-size:2.5rem">Select <span>Game</span></h1>\n      <div class="games-search">\n        <span class="search-icon">&#128269;</span>\n        <input type="text" id="gameSearch" placeholder="Search games..." data-testid="input-game-search" />\n      </div>\n    </div>\n    <div class="games-grid" id="gamesGrid">\n      ' + GAMES.map(function(g) {
    var score = getScore(g.lsKey);
    return '<div class="game-card" data-game="' + g.id + '" onclick="window.location.hash=' + "'game/" + g.id + "'" + '" data-testid="card-game-' + g.id + '" style="cursor:pointer">' +
      '<div class="game-card-top"><span class="game-icon">' + g.icon + '</span><span class="game-tag">' + g.tag + '</span></div>' +
      '<div class="game-name">' + g.name + '</div>' +
      '<div class="game-desc">' + g.desc + '</div>' +
      '<div class="game-footer">' +
        '<div class="game-score">' + (score !== null ? 'BEST: <span class="score-val">' + score + '</span>' : '<span style="color:var(--text-dim)">No score yet</span>') + '</div>' +
        '<button class="btn btn-play" onclick="event.stopPropagation();window.location.hash=' + "'game/" + g.id + "'" + '" data-testid="btn-play-' + g.id + '">PLAY</button>' +
      '</div>' +
    '</div>';
  }).join('') + '\n    </div>\n  </div>';

  document.getElementById('gameSearch').addEventListener('input', function(e) {
    var q = e.target.value.toLowerCase();
    document.querySelectorAll('.game-card').forEach(function(card) {
      var name = card.querySelector('.game-name').textContent.toLowerCase();
      var desc = card.querySelector('.game-desc').textContent.toLowerCase();
      card.style.display = (name.includes(q) || desc.includes(q)) ? '' : 'none';
    });
  });
}

function gameWrapper(title, content) {
  return '<div class="game-screen">' +
    '<div class="game-screen-header">' +
      '<button class="back-btn" onclick="window.location.hash=\'\'" data-testid="btn-back">&larr; Games</button>' +
      '<span class="game-screen-title">' + title + '</span>' +
    '</div>' +
    '<div class="game-body">' + content + '</div>' +
  '</div>';
}

function renderGame(app, gameId) {
  var renderers = { rps:renderRPS, guess:renderGuess, memory:renderMemory, clicker:renderClicker, reflex:renderReflex, snake:renderSnake, ttt:renderTTT, scramble:renderScramble, mole:renderMole, math:renderMath };
  var fn = renderers[gameId];
  if (!fn) { window.location.hash = ''; return; }
  app.innerHTML = '<div class="page active">' + fn() + '</div>';
  initGame(gameId);
}

function initGame(id) {
  var inits = { rps:window.initRPS, guess:window.initGuess, memory:initMemory, clicker:initClicker, reflex:initReflex, snake:window.initSnake, ttt:window.initTTT, scramble:window.initScramble, mole:initMole, math:window.initMath };
  if (inits[id]) inits[id]();
}

function render() {
  stopAllGames();
  var hash = window.location.hash.slice(1);
  var app = document.getElementById('app');
  if (!app) return;
  if (!hash || hash === 'games') {
    renderGames(app);
  } else if (hash.startsWith('game/')) {
    var gameId = hash.split('/')[1];
    renderGame(app, gameId);
  } else {
    renderGames(app);
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
render();

// ============================================================
// GAME: ROCK PAPER SCISSORS
// ============================================================
function renderRPS() {
  return gameWrapper('RO SHAM BO', '<div style="text-align:center">' +
    '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.5rem">' +
      '<div class="stat-pill"><span class="pill-val" id="rps-wins">0</span><span class="pill-label">Wins</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="rps-losses">0</span><span class="pill-label">Losses</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="rps-draws">0</span><span class="pill-label">Draws</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="rps-round">1</span><span class="pill-label">Round</span></div>' +
    '</div>' +
    '<p style="color:var(--text-muted);margin-bottom:1rem;font-size:0.85rem">Best of 5 — Choose your weapon</p>' +
    '<div class="rps-choices">' +
      '<button class="rps-btn" id="rps-rock" onclick="playRPS(' + "'rock'" + ')" data-testid="btn-rock">✊</button>' +
      '<button class="rps-btn" id="rps-paper" onclick="playRPS(' + "'paper'" + ')" data-testid="btn-paper">✋</button>' +
      '<button class="rps-btn" id="rps-scissors" onclick="playRPS(' + "'scissors'" + ')" data-testid="btn-scissors">✌️</button>' +
    '</div>' +
    '<div id="rps-result" style="min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem"></div>' +
    '<button class="btn btn-secondary" onclick="window.initRPS()" data-testid="btn-rps-new" style="margin-top:1rem">New Game</button>' +
  '</div>');
}

window.initRPS = function() {
  window._rps = { wins:0, losses:0, draws:0, round:1 };
  ['wins','losses','draws'].forEach(function(k) {
    var el = document.getElementById('rps-' + k);
    if (el) el.textContent = '0';
  });
  var el = document.getElementById('rps-round');
  if (el) el.textContent = '1';
  var res = document.getElementById('rps-result');
  if (res) res.innerHTML = '';
  document.querySelectorAll('.rps-btn').forEach(function(b) { b.disabled = false; b.classList.remove('selected'); });
};

window.playRPS = function(choice) {
  var s = window._rps;
  if (!s || s.round > 5) return;
  var choices = ['rock','paper','scissors'];
  var cpu = choices[Math.floor(Math.random() * 3)];
  var emojis = { rock:'✊', paper:'✋', scissors:'✌️' };
  var outcome;
  if (choice === cpu) outcome = 'draw';
  else if ((choice==='rock'&&cpu==='scissors')||(choice==='paper'&&cpu==='rock')||(choice==='scissors'&&cpu==='paper')) outcome = 'win';
  else outcome = 'loss';
  if (outcome==='win') s.wins++; else if (outcome==='loss') s.losses++; else s.draws++;
  s.round++;
  ['wins','losses','draws'].forEach(function(k) { document.getElementById('rps-' + k).textContent = s[k]; });
  document.getElementById('rps-round').textContent = Math.min(s.round, 5);
  var colors = { win:'var(--green)', loss:'var(--magenta)', draw:'var(--yellow)' };
  var labels = { win:'YOU WIN!', loss:'CPU WINS', draw:'DRAW' };
  document.getElementById('rps-result').innerHTML =
    '<div style="font-size:2rem">' + emojis[choice] + ' vs ' + emojis[cpu] + '</div>' +
    '<div style="font-family:var(--font-display);font-size:0.8rem;color:' + colors[outcome] + '">' + labels[outcome] + '</div>';
  if (s.round > 5) {
    setTimeout(function() {
      var winner = s.wins > s.losses ? 'YOU WIN THE MATCH!' : s.losses > s.wins ? 'CPU WINS THE MATCH' : 'MATCH TIED';
      var wc = s.wins > s.losses ? 'var(--green)' : s.losses > s.wins ? 'var(--magenta)' : 'var(--yellow)';
      document.getElementById('rps-result').innerHTML =
        '<div style="font-family:var(--font-display);font-size:0.75rem;color:' + wc + ';line-height:1.8">' + winner +
        '<br><span style="color:var(--text-muted);font-size:0.65rem">' + s.wins + '–' + s.losses + '–' + s.draws + '</span></div>';
      document.querySelectorAll('.rps-btn').forEach(function(b) { b.disabled = true; });
    }, 800);
  }
};

function initRPS() { window.initRPS(); }

// ============================================================
// GAME: NUMBER GUESS
// ============================================================
function renderGuess() {
  var best = localStorage.getItem('arcade_guess_best');
  return gameWrapper('NUMBER GUESS', '<div style="text-align:center">' +
    '<p style="color:var(--text-muted);margin-bottom:1.5rem;font-size:0.85rem">I\'m thinking of a number between <span style="color:var(--cyan)">1</span> and <span style="color:var(--cyan)">100</span></p>' +
    '<div style="display:flex;gap:1rem;justify-content:center;margin-bottom:1.5rem">' +
      '<div class="stat-pill"><span class="pill-val" id="guess-count">0</span><span class="pill-label">Guesses</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="guess-best">' + (best || '—') + '</span><span class="pill-label">Best</span></div>' +
    '</div>' +
    '<div id="guess-hint" style="min-height:2rem;margin-bottom:1rem;font-family:var(--font-display);font-size:0.7rem;color:var(--text-muted)">Make your first guess!</div>' +
    '<div style="display:flex;gap:0.75rem;max-width:300px;margin:0 auto 1rem">' +
      '<input type="number" id="guess-input" min="1" max="500" placeholder="1-500" data-testid="input-guess" style="flex:1" />' +
      '<button class="btn btn-primary" onclick="submitGuess()" data-testid="btn-guess">Go</button>' +
    '</div>' +
    '<button class="btn btn-secondary" onclick="window.initGuess()" data-testid="btn-guess-new" style="margin-top:0.5rem">New Game</button>' +
  '</div>');
}

window.initGuess = function() {
  window._guess = { target: Math.floor(Math.random() * 100) + 1, count: 0, done: false };
  var el = document.getElementById('guess-count'); if (el) el.textContent = '0';
  var hint = document.getElementById('guess-hint');
  if (hint) { hint.textContent = 'Make your first guess!'; hint.style.color = 'var(--text-muted)'; }
  var inp = document.getElementById('guess-input'); if (inp) { inp.value = ''; inp.disabled = false; }
};

window.submitGuess = function() {
  var s = window._guess;
  if (!s || s.done) return;
  var inp = document.getElementById('guess-input');
  var val = parseInt(inp.value);
  if (!val || val < 1 || val > 500) return;
  s.count++;
  document.getElementById('guess-count').textContent = s.count;
  var hint = document.getElementById('guess-hint');
  if (val === s.target) {
    s.done = true;
    inp.disabled = true;
    var best = parseInt(localStorage.getItem('arcade_guess_best')) || 999;
    if (s.count < best) { localStorage.setItem('arcade_guess_best', s.count); document.getElementById('guess-best').textContent = s.count; }
    hint.style.color = 'var(--green)';
    hint.innerHTML = 'CORRECT! The number was ' + s.target + '. You got it in ' + s.count + ' guess' + (s.count !== 1 ? 'es' : '') + '!';
  } else if (val < s.target) {
    hint.style.color = 'var(--yellow)';
    hint.textContent = 'TOO LOW — go higher!';
  } else {
    hint.style.color = 'var(--magenta)';
    hint.textContent = 'TOO HIGH — go lower!';
  }
  inp.value = '';
};

function initGuess() { window.initGuess(); }

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.getElementById('guess-input') === document.activeElement) window.submitGuess();
});

// ============================================================
// GAME: MEMORY MATCH
// ============================================================
var MEM_EMOJIS = ['🌟','🎮','🚀','🎸','🦊','🍕','🎯','🔮','🌈','🎭','🦋','🍀','🎲','🔥','🌙','🎪','💎','🐉'];

function renderMemory() {
  return gameWrapper('MEMORY MATCH', '<div style="text-align:center">' +
    '<div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:1rem">' +
      '<div class="stat-pill"><span class="pill-val" id="mem-moves">0</span><span class="pill-label">Moves</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="mem-time">0s</span><span class="pill-label">Time</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="mem-pairs">0/8</span><span class="pill-label">Pairs</span></div>' +
    '</div>' +
    '<div style="display:flex;gap:0.5rem;justify-content:center;margin-bottom:1rem">' +
      '<button class="btn btn-secondary" onclick="startMemory(4)" data-testid="btn-mem-easy" style="font-size:0.7rem;padding:0.4rem 0.8rem">4x4 Easy</button>' +
      '<button class="btn btn-secondary" onclick="startMemory(6)" data-testid="btn-mem-hard" style="font-size:0.7rem;padding:0.4rem 0.8rem">6x6 Hard</button>' +
    '</div>' +
    '<div id="mem-grid" class="memory-grid" style="max-width:400px;margin:0 auto"></div>' +
    '<div id="mem-win" style="display:none;margin-top:1rem" class="result-overlay">' +
      '<span class="result-emoji">🎉</span>' +
      '<div class="result-title" style="color:var(--green)">ALL MATCHED!</div>' +
      '<div id="mem-win-msg" class="result-sub"></div>' +
      '<button class="btn btn-primary" onclick="startMemory(window._mem.size)" data-testid="btn-mem-retry">Play Again</button>' +
    '</div>' +
  '</div>');
}

function initMemory() { startMemory(4); }

window.startMemory = function(size) {
  var pairs = size * size / 2;
  var emojis = MEM_EMOJIS.slice(0, pairs);
  var cards = emojis.concat(emojis).sort(function() { return Math.random() - 0.5; });
  if (window._mem && window._mem.timer) clearInterval(window._mem.timer);
  var lsKey = size === 4 ? 'arcade_memory_easy_best' : 'arcade_memory_hard_best';
  window._mem = { cards:cards, flipped:[], matched:[], moves:0, size:size, pairs:pairs, seconds:0, timer:null, done:false, lsKey:lsKey };
  document.getElementById('mem-moves').textContent = '0';
  document.getElementById('mem-time').textContent = '0s';
  document.getElementById('mem-pairs').textContent = '0/' + pairs;
  document.getElementById('mem-win').style.display = 'none';
  var grid = document.getElementById('mem-grid');
  grid.style.gridTemplateColumns = 'repeat(' + size + ',1fr)';
  grid.innerHTML = cards.map(function(e, i) {
    return '<div class="mem-card" data-idx="' + i + '" onclick="flipCard(' + i + ')" data-testid="mem-card-' + i + '">' +
      '<span class="card-face">' + e + '</span>' +
      '<span class="card-back" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%">?</span>' +
    '</div>';
  }).join('');
  window._mem.timer = setInterval(function() {
    if (!window._mem.done) {
      window._mem.seconds++;
      var el = document.getElementById('mem-time');
      if (el) el.textContent = window._mem.seconds + 's';
    }
  }, 1000);
  setCleanup(function() { if (window._mem && window._mem.timer) clearInterval(window._mem.timer); });
};

window.flipCard = function(idx) {
  var s = window._mem;
  if (!s || s.done) return;
  if (s.flipped.includes(idx) || s.matched.includes(idx) || s.flipped.length >= 2) return;
  s.flipped.push(idx);
  var card = document.querySelector('.mem-card[data-idx="' + idx + '"]');
  if (card) card.classList.add('flipped');
  if (s.flipped.length === 2) {
    s.moves++;
    document.getElementById('mem-moves').textContent = s.moves;
    var a = s.flipped[0], b = s.flipped[1];
    if (s.cards[a] === s.cards[b]) {
      s.matched.push(a, b);
      var ca = document.querySelector('.mem-card[data-idx="' + a + '"]');
      var cb = document.querySelector('.mem-card[data-idx="' + b + '"]');
      if (ca) ca.classList.add('matched');
      if (cb) cb.classList.add('matched');
      document.getElementById('mem-pairs').textContent = (s.matched.length / 2) + '/' + s.pairs;
      s.flipped = [];
      if (s.matched.length === s.cards.length) {
        s.done = true;
        clearInterval(s.timer);
        var best = parseInt(localStorage.getItem(s.lsKey)) || 99999;
        var newBest = s.seconds < best;
        if (newBest) localStorage.setItem(s.lsKey, s.seconds);
        document.getElementById('mem-win').style.display = 'block';
        document.getElementById('mem-win-msg').textContent = 'Completed in ' + s.seconds + 's with ' + s.moves + ' moves.' + (newBest ? ' New best!' : '');
      }
    } else {
      setTimeout(function() {
        var ia = s.flipped[0], ib = s.flipped[1];
        var qa = document.querySelector('.mem-card[data-idx="' + ia + '"]');
        var qb = document.querySelector('.mem-card[data-idx="' + ib + '"]');
        if (qa) qa.classList.remove('flipped');
        if (qb) qb.classList.remove('flipped');
        s.flipped = [];
      }, 900);
    }
  }
};

// ============================================================
// GAME: COIN CLICKER
// ============================================================
var UPGRADES_DEF = [
  { id:'bot',     name:'Bot',          desc:'A simple clicking bot',                   cost:10,   cps:1 },
  { id:'script',  name:'Script',       desc:'Automated script runner',                 cost:50,   cps:5 },
  { id:'server',  name:'Server Farm',  desc:'Dozens of machines clicking away',        cost:500,  cps:50 },
  { id:'quantum', name:'Quantum Core', desc:'Quantum parallel clicking',               cost:5000, cps:500 },
];

function renderClicker() {
  return gameWrapper('COIN CLICKER',
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start">' +
      '<div class="clicker-center">' +
        '<div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.5rem">' +
          '<div class="stat-pill"><span class="pill-val" id="click-coins">0</span><span class="pill-label">Coins</span></div>' +
          '<div class="stat-pill"><span class="pill-val" id="click-cps">0</span><span class="pill-label">Per Sec</span></div>' +
        '</div>' +
        '<button class="click-btn" id="clickBtn" onclick="doClick()" data-testid="btn-click">' +
          '<span class="click-coin">🪙</span><span>CLICK</span>' +
        '</button>' +
        '<div style="margin-top:1.5rem">' +
          '<button class="btn btn-secondary" onclick="prestigeClick()" id="prestige-btn" style="font-size:0.7rem;display:none" data-testid="btn-prestige">PRESTIGE (x2 mult)</button>' +
        '</div>' +
      '</div>' +
      '<div>' +
        '<p style="font-family:var(--font-mono);font-size:0.65rem;color:var(--text-dim);letter-spacing:2px;margin-bottom:0.75rem">UPGRADES</p>' +
        '<div class="upgrades-grid" id="upgrades-list"></div>' +
      '</div>' +
    '</div>');
}

function initClicker() {
  var saved = (function() { try { return JSON.parse(localStorage.getItem('arcade_clicker_save') || 'null'); } catch(e) { return null; } })();
  window._clicker = saved || { coins:0, mult:1, upgrades:{}, cps:0 };
  updateClickerUI();
  window._clickerTick = setInterval(function() {
    var s = window._clicker;
    if (!s || !document.getElementById('click-coins')) { clearInterval(window._clickerTick); return; }
    s.coins += s.cps * s.mult / 10;
    saveClicker();
    document.getElementById('click-coins').textContent = Math.floor(s.coins);
    var pb = document.getElementById('prestige-btn');
    if (pb) pb.style.display = s.coins >= 10000 ? 'inline-flex' : 'none';
  }, 100);
  setCleanup(function() { clearInterval(window._clickerTick); });
}

function saveClicker() { localStorage.setItem('arcade_clicker_save', JSON.stringify(window._clicker)); }

function updateClickerUI() {
  var s = window._clicker;
  var cc = document.getElementById('click-coins');
  if (cc) cc.textContent = Math.floor(s.coins);
  var cs = document.getElementById('click-cps');
  if (cs) cs.textContent = (s.cps * s.mult).toFixed(1);
  var list = document.getElementById('upgrades-list');
  if (!list) return;
  list.innerHTML = UPGRADES_DEF.map(function(u) {
    var owned = s.upgrades[u.id] || 0;
    var canBuy = s.coins >= u.cost * (owned + 1);
    return '<button class="upgrade-btn" ' + (!canBuy ? 'disabled' : '') + ' onclick="buyUpgrade(' + "'" + u.id + "'" + ')" data-testid="btn-upgrade-' + u.id + '">' +
      '<div class="upgrade-info">' +
        '<div class="upgrade-name">' + u.name + ' <span class="upgrade-owned">[' + owned + ']</span></div>' +
        '<div class="upgrade-desc">' + u.desc + ' (+' + u.cps + ' CPS)</div>' +
      '</div>' +
      '<div class="upgrade-cost">🪙 ' + (u.cost * (owned + 1)) + '</div>' +
    '</button>';
  }).join('');
}

window.doClick = function() {
  var s = window._clicker;
  if (!s) return;
  s.coins += 1 * s.mult;
  var cc = document.getElementById('click-coins');
  if (cc) cc.textContent = Math.floor(s.coins);
  var btn = document.getElementById('clickBtn');
  if (btn) { btn.style.transform = 'scale(0.93)'; setTimeout(function() { btn.style.transform = ''; }, 100); }
  updateClickerUI();
};

window.buyUpgrade = function(id) {
  var s = window._clicker;
  var u = UPGRADES_DEF.filter(function(x) { return x.id === id; })[0];
  if (!u) return;
  var owned = s.upgrades[id] || 0;
  var cost = u.cost * (owned + 1);
  if (s.coins < cost) return;
  s.coins -= cost;
  s.upgrades[id] = owned + 1;
  s.cps = UPGRADES_DEF.reduce(function(acc, x) { return acc + (s.upgrades[x.id] || 0) * x.cps; }, 0);
  var cs = document.getElementById('click-cps');
  if (cs) cs.textContent = (s.cps * s.mult).toFixed(1);
  saveClicker();
  updateClickerUI();
};

window.prestigeClick = function() {
  var s = window._clicker;
  if (s.coins < 10000) return;
  s.mult = (s.mult || 1) * 2;
  s.coins = 0;
  s.upgrades = {};
  s.cps = 0;
  saveClicker();
  updateClickerUI();
};

// ============================================================
// GAME: SPEED REFLEX
// ============================================================
function renderReflex() {
  var best = localStorage.getItem('arcade_reflex_best');
  return gameWrapper('SPEED TEST', '<div style="text-align:center">' +
    '<div style="display:flex;gap:1rem;justify-content:center;margin-bottom:1.5rem;flex-wrap:wrap">' +
      '<div class="stat-pill"><span class="pill-val" id="rx-last">—</span><span class="pill-label">Last (ms)</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="rx-avg">—</span><span class="pill-label">Avg (ms)</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="rx-best">' + (best || '—') + '</span><span class="pill-label">Best (ms)</span></div>' +
    '</div>' +
    '<div class="reflex-screen ready" id="rx-screen" onclick="handleReflexClick()" data-testid="btn-reflex-screen">' +
      '<div class="reflex-title" id="rx-title" style="color:var(--cyan)">CLICK TO START</div>' +
      '<div class="reflex-sub" id="rx-sub">Wait for green, then click!</div>' +
    '</div>' +
    '<div class="history-list" id="rx-history"></div>' +
  '</div>');
}

function initReflex() {
  window._reflex = { state:'idle', history:[], timer:null };
  setCleanup(function() { if (window._reflex && window._reflex.timer) clearTimeout(window._reflex.timer); });
}

window.handleReflexClick = function() {
  var s = window._reflex;
  if (!s) return;
  if (s.state === 'idle' || s.state === 'result') {
    s.state = 'waiting';
    var scr = document.getElementById('rx-screen');
    scr.className = 'reflex-screen waiting';
    document.getElementById('rx-title').textContent = 'GET READY...';
    document.getElementById('rx-title').style.color = 'var(--yellow)';
    document.getElementById('rx-sub').textContent = "Don't click yet!";
    var delay = 1500 + Math.random() * 3500;
    s.timer = setTimeout(function() {
      s.state = 'go'; s.start = Date.now();
      scr.className = 'reflex-screen go';
      document.getElementById('rx-title').textContent = 'CLICK NOW!';
      document.getElementById('rx-title').style.color = 'var(--green)';
      document.getElementById('rx-sub').textContent = '';
    }, delay);
  } else if (s.state === 'waiting') {
    clearTimeout(s.timer);
    s.state = 'result';
    var scr2 = document.getElementById('rx-screen');
    scr2.className = 'reflex-screen early';
    document.getElementById('rx-title').textContent = 'TOO EARLY!';
    document.getElementById('rx-title').style.color = 'var(--magenta)';
    document.getElementById('rx-sub').textContent = '+500ms penalty. Click to try again.';
    s.history.push(null);
    document.getElementById('rx-last').textContent = '+500ms';
  } else if (s.state === 'go') {
    var ms = Date.now() - s.start;
    s.history.push(ms);
    if (s.history.length > 5) s.history.shift();
    var real = s.history.filter(function(x) { return x !== null; });
    var avg = real.length ? Math.round(real.reduce(function(a, b) { return a + b; }, 0) / real.length) : 0;
    var best = parseInt(localStorage.getItem('arcade_reflex_best')) || 99999;
    if (ms < best) { localStorage.setItem('arcade_reflex_best', ms); document.getElementById('rx-best').textContent = ms; }
    document.getElementById('rx-last').textContent = ms;
    document.getElementById('rx-avg').textContent = avg;
    s.state = 'result';
    var scr3 = document.getElementById('rx-screen');
    scr3.className = 'reflex-screen ready';
    document.getElementById('rx-title').style.color = 'var(--cyan)';
    document.getElementById('rx-title').textContent = ms + 'ms';
    document.getElementById('rx-sub').textContent = ms < 200 ? 'INHUMAN!' : ms < 300 ? 'BLAZING!' : ms < 500 ? 'SOLID!' : 'Click again to improve';
    var hist = document.getElementById('rx-history');
    if (hist) hist.innerHTML = s.history.map(function(v, i) {
      return '<div class="history-item"><span>#' + (i + 1) + '</span><span class="val">' + (v === null ? '+500ms (early)' : v + 'ms') + '</span></div>';
    }).join('');
  }
};

// ============================================================
// GAME: SNAKE
// ============================================================
function renderSnake() {
  return gameWrapper('SNAKE', '<div style="text-align:center">' +
    '<div style="display:flex;gap:1rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">' +
      '<div class="stat-pill"><span class="pill-val" id="sn-score">0</span><span class="pill-label">Score</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="sn-best">' + (localStorage.getItem('arcade_snake_best') || '0') + '</span><span class="pill-label">Best</span></div>' +
    '</div>' +
    '<p style="color:var(--text-muted);font-size:0.75rem;margin-bottom:0.75rem">Arrow keys or WASD to move</p>' +
    '<canvas id="snake-canvas" width="400" height="400"></canvas>' +
    '<div id="sn-overlay" style="display:none;margin-top:1rem" class="result-overlay">' +
      '<div class="result-title" id="sn-result-title">GAME OVER</div>' +
      '<div class="result-sub" id="sn-result-sub"></div>' +
      '<button class="btn btn-primary" onclick="window.initSnake()" data-testid="btn-snake-retry" style="margin-top:1rem">Play Again</button>' +
    '</div>' +
  '</div>');
}

window.initSnake = function() {
  var canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var CELL = 20, COLS = 20, ROWS = 20;
  var snake = [{x:10,y:10}], dir = {x:1,y:0}, nextDir = {x:1,y:0}, food = null, score = 0, running = true, speed = 150;
  document.getElementById('sn-overlay').style.display = 'none';
  document.getElementById('sn-score').textContent = '0';

  function placeFood() {
    var f;
    do { f = {x:Math.floor(Math.random()*COLS), y:Math.floor(Math.random()*ROWS)}; }
    while (snake.some(function(s) { return s.x===f.x && s.y===f.y; }));
    food = f;
  }
  placeFood();

  function draw() {
    ctx.fillStyle = '#0d0d1f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,245,255,0.05)';
    for (var x = 0; x < COLS; x++) for (var y = 0; y < ROWS; y++) ctx.fillRect(x*CELL+CELL/2-1, y*CELL+CELL/2-1, 2, 2);
    ctx.fillStyle = '#ff00c8'; ctx.shadowColor = '#ff00c8'; ctx.shadowBlur = 10;
    ctx.fillRect(food.x*CELL+2, food.y*CELL+2, CELL-4, CELL-4);
    ctx.shadowBlur = 0;
    snake.forEach(function(seg, i) {
      var g = i === 0 ? '#00f5ff' : 'rgba(0,245,255,0.6)';
      ctx.fillStyle = g; ctx.shadowColor = g; ctx.shadowBlur = i === 0 ? 12 : 4;
      ctx.fillRect(seg.x*CELL+1, seg.y*CELL+1, CELL-2, CELL-2);
      ctx.shadowBlur = 0;
    });
  }

  function tick() {
    if (!running || !document.getElementById('sn-score')) return;
    dir = {x:nextDir.x, y:nextDir.y};
    var head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};
    if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||snake.some(function(s){return s.x===head.x&&s.y===head.y;})) {
      running = false;
      clearInterval(window._snakeTick);
      var best = parseInt(localStorage.getItem('arcade_snake_best')) || 0;
      var nb = score > best;
      if (nb) localStorage.setItem('arcade_snake_best', score);
      var ov = document.getElementById('sn-overlay'); if (ov) ov.style.display = 'block';
      var rt = document.getElementById('sn-result-title'); if (rt) rt.style.color = 'var(--magenta)';
      var rs = document.getElementById('sn-result-sub'); if (rs) rs.textContent = 'Score: ' + score + (nb ? ' — NEW BEST!' : '');
      var sb = document.getElementById('sn-best'); if (sb) sb.textContent = Math.max(score, best);
      return;
    }
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) {
      score++;
      document.getElementById('sn-score').textContent = score;
      placeFood();
      if (score % 5 === 0) { clearInterval(window._snakeTick); speed = Math.max(60, speed-15); window._snakeTick = setInterval(tick, speed); }
    } else { snake.pop(); }
    draw();
  }

  var keyHandler = function(e) {
    var map = {ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}};
    var nd = map[e.key];
    if (nd && !(nd.x===-dir.x && nd.y===-dir.y)) { nextDir = nd; e.preventDefault(); }
  };
  document.addEventListener('keydown', keyHandler);
  draw();
  window._snakeTick = setInterval(tick, speed);
  setCleanup(function() { clearInterval(window._snakeTick); document.removeEventListener('keydown', keyHandler); });
};

// ============================================================
// GAME: TIC-TAC-TOE
// ============================================================
function renderTTT() {
  return gameWrapper('TIC-TAC-TOE', '<div style="text-align:center">' +
    '<div style="display:flex;gap:1rem;justify-content:center;margin-bottom:1.5rem;flex-wrap:wrap">' +
      '<div class="stat-pill"><span class="pill-val" id="ttt-streak">0</span><span class="pill-label">Streak</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="ttt-status" style="font-size:0.6rem;padding:0.2rem">YOUR TURN</span><span class="pill-label">Status</span></div>' +
    '</div>' +
    '<div class="ttt-grid" id="ttt-grid">' +
      Array(9).fill(0).map(function(_, i) {
        return '<div class="ttt-cell" data-idx="' + i + '" onclick="tttMove(' + i + ')" data-testid="ttt-cell-' + i + '"></div>';
      }).join('') +
    '</div>' +
    '<button class="btn btn-secondary" onclick="window.initTTT()" data-testid="btn-ttt-new" style="margin-top:1.5rem">New Game</button>' +
  '</div>');
}

window.initTTT = function() {
  window._ttt = { board:Array(9).fill(''), done:false, streak: (window._ttt ? window._ttt.streak : 0) };
  document.querySelectorAll('.ttt-cell').forEach(function(c) { c.textContent = ''; c.className = 'ttt-cell'; });
  var st = document.getElementById('ttt-status'); if (st) st.textContent = 'YOUR TURN';
  var sk = document.getElementById('ttt-streak'); if (sk) sk.textContent = window._ttt.streak;
};

var TTT_WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkTTT(b, p) {
  return TTT_WINS.filter(function(l) { return l.every(function(i) { return b[i] === p; }); })[0];
}

window.tttMove = function(idx) {
  var s = window._ttt;
  if (!s || s.done || s.board[idx]) return;
  s.board[idx] = 'X';
  var cell = document.querySelector('.ttt-cell[data-idx="' + idx + '"]');
  if (cell) { cell.textContent = '✕'; cell.classList.add('x'); }
  var win = checkTTT(s.board, 'X');
  if (win) {
    s.done = true; s.streak++;
    win.forEach(function(i) { var c = document.querySelector('.ttt-cell[data-idx="' + i + '"]'); if (c) c.classList.add('win'); });
    document.getElementById('ttt-status').textContent = 'YOU WIN!';
    document.getElementById('ttt-streak').textContent = s.streak;
    return;
  }
  var empty = s.board.map(function(v, i) { return v ? null : i; }).filter(function(x) { return x !== null; });
  if (!empty.length) { s.done = true; document.getElementById('ttt-status').textContent = 'DRAW!'; return; }
  var cpuIdx = empty[Math.floor(Math.random() * empty.length)];
  s.board[cpuIdx] = 'O';
  var cpuCell = document.querySelector('.ttt-cell[data-idx="' + cpuIdx + '"]');
  if (cpuCell) { cpuCell.textContent = '○'; cpuCell.classList.add('o'); }
  var cpuWin = checkTTT(s.board, 'O');
  if (cpuWin) {
    s.done = true; s.streak = 0;
    cpuWin.forEach(function(i) { var c = document.querySelector('.ttt-cell[data-idx="' + i + '"]'); if (c) c.classList.add('win'); });
    document.getElementById('ttt-status').textContent = 'CPU WINS';
    document.getElementById('ttt-streak').textContent = s.streak;
    return;
  }
  var empty2 = s.board.map(function(v, i) { return v ? null : i; }).filter(function(x) { return x !== null; });
  if (!empty2.length) { s.done = true; document.getElementById('ttt-status').textContent = 'DRAW!'; }
};

// ============================================================
// GAME: WORD SCRAMBLE
// ============================================================
var WORDS = ['PIXEL','ARCADE','NEON','RETRO','SCORE','LASER','QUEST','BLAST','SWORD','MAGIC','FLAME','CLOUD','OCEAN','BEACH','TRAIN','STORM','CRASH','LIGHT','SPACE','POWER','BONUS','LEVEL','ULTRA','TURBO','PRIME'];

function scrambleWord(w) {
  var a = w.split('');
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a.join('') === w ? scrambleWord(w) : a.join('');
}

function renderScramble() {
  var best = localStorage.getItem('arcade_scramble_best');
  return gameWrapper('WORD SCRAMBLE', '<div style="text-align:center">' +
    '<div style="display:flex;gap:1rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">' +
      '<div class="stat-pill"><span class="pill-val" id="sc-score">0</span><span class="pill-label">Score</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="sc-word">1/10</span><span class="pill-label">Word</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="sc-time">30</span><span class="pill-label">Sec Left</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="sc-best">' + (best || '—') + '</span><span class="pill-label">Best</span></div>' +
    '</div>' +
    '<div class="timer-bar"><div class="timer-fill" id="sc-bar" style="width:100%"></div></div>' +
    '<div id="sc-scrambled" class="scramble-word">------</div>' +
    '<div id="sc-feedback" style="min-height:1.5rem;color:var(--green);font-family:var(--font-display);font-size:0.65rem;margin-bottom:0.75rem"></div>' +
    '<div style="display:flex;gap:0.75rem;max-width:300px;margin:0 auto 1rem">' +
      '<input type="text" id="sc-input" placeholder="Type the word..." data-testid="input-scramble" style="flex:1;text-transform:uppercase" />' +
      '<button class="btn btn-primary" onclick="submitScramble()" data-testid="btn-scramble-submit">Go</button>' +
    '</div>' +
    '<button class="btn btn-secondary" onclick="window.initScramble()" data-testid="btn-scramble-new">New Game</button>' +
    '<div id="sc-done" style="display:none;margin-top:1rem" class="result-overlay">' +
      '<span class="result-emoji">🎉</span>' +
      '<div class="result-title" id="sc-done-title"></div>' +
      '<div class="result-sub" id="sc-done-sub"></div>' +
      '<button class="btn btn-primary" onclick="window.initScramble()" data-testid="btn-scramble-retry">Play Again</button>' +
    '</div>' +
  '</div>');
}

window.initScramble = function() {
  if (window._sc && window._sc.timer) clearInterval(window._sc.timer);
  var pool = WORDS.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 10);
  window._sc = { words:pool, idx:0, score:0, timer:null, timeLeft:30, done:false };
  document.getElementById('sc-done').style.display = 'none';
  document.getElementById('sc-score').textContent = '0';
  document.getElementById('sc-word').textContent = '1/10';
  document.getElementById('sc-input').disabled = false;
  showScramble();
  window._sc.timer = setInterval(function() {
    var s = window._sc;
    if (!s || s.done) return;
    s.timeLeft--;
    var el = document.getElementById('sc-time'); if (el) el.textContent = s.timeLeft;
    var bar = document.getElementById('sc-bar'); if (bar) { bar.style.width = (s.timeLeft/30*100) + '%'; if (s.timeLeft < 10) bar.classList.add('urgent'); }
    if (s.timeLeft <= 0) {
      var fb = document.getElementById('sc-feedback'); if (fb) { fb.style.color = 'var(--magenta)'; fb.textContent = 'TIME! Answer: ' + s.words[s.idx]; }
      s.timeLeft = 30; if (bar) { bar.style.width = '100%'; bar.classList.remove('urgent'); }
      s.idx++;
      if (s.idx >= s.words.length) { endScramble(); return; }
      document.getElementById('sc-word').textContent = (s.idx+1) + '/10';
      showScramble();
    }
  }, 1000);
  setCleanup(function() { if (window._sc && window._sc.timer) clearInterval(window._sc.timer); });
};

function showScramble() {
  var s = window._sc;
  var w = s.words[s.idx];
  document.getElementById('sc-scrambled').textContent = scrambleWord(w);
  document.getElementById('sc-feedback').textContent = '';
  var inp = document.getElementById('sc-input'); if (inp) { inp.value = ''; inp.focus(); }
}

function endScramble() {
  var s = window._sc;
  clearInterval(s.timer); s.done = true;
  document.getElementById('sc-input').disabled = true;
  var best = parseInt(localStorage.getItem('arcade_scramble_best')) || 0;
  var nb = s.score > best;
  if (nb) localStorage.setItem('arcade_scramble_best', s.score);
  document.getElementById('sc-done').style.display = 'block';
  document.getElementById('sc-done-title').textContent = 'SCORE: ' + s.score + '/10';
  document.getElementById('sc-done-sub').textContent = (nb ? 'New best! ' : '') + 'Great run!';
}

window.submitScramble = function() {
  var s = window._sc;
  if (!s || s.done) return;
  var inp = document.getElementById('sc-input');
  var val = inp.value.trim().toUpperCase();
  if (!val) return;
  var correct = s.words[s.idx];
  var fb = document.getElementById('sc-feedback');
  if (val === correct) {
    s.score++; s.idx++;
    document.getElementById('sc-score').textContent = s.score;
    if (s.idx >= s.words.length) { endScramble(); return; }
    document.getElementById('sc-word').textContent = (s.idx+1) + '/10';
    s.timeLeft = 30;
    var el = document.getElementById('sc-time'); if (el) el.textContent = 30;
    var bar = document.getElementById('sc-bar'); if (bar) { bar.style.width = '100%'; bar.classList.remove('urgent'); }
    if (fb) { fb.style.color = 'var(--green)'; fb.textContent = 'CORRECT!'; }
    showScramble();
  } else {
    if (fb) { fb.style.color = 'var(--magenta)'; fb.textContent = 'WRONG!'; }
    inp.value = '';
  }
};

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.getElementById('sc-input') === document.activeElement) window.submitScramble();
});

// ============================================================
// GAME: WHACK-A-MOLE
// ============================================================
function renderMole() {
  var best = localStorage.getItem('arcade_mole_best');
  return gameWrapper('WHACK-A-MOLE', '<div style="text-align:center">' +
    '<div style="display:flex;gap:1rem;justify-content:center;margin-bottom:1.5rem;flex-wrap:wrap">' +
      '<div class="stat-pill"><span class="pill-val" id="mol-score">0</span><span class="pill-label">Score</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="mol-time">30</span><span class="pill-label">Sec Left</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="mol-best">' + (best || '—') + '</span><span class="pill-label">Best</span></div>' +
    '</div>' +
    '<div class="timer-bar"><div class="timer-fill" id="mol-bar" style="width:100%"></div></div>' +
    '<div class="mole-grid" id="mole-grid" style="grid-template-columns:repeat(3,1fr);max-width:350px;margin:1rem auto"></div>' +
    '<div id="mol-start" style="margin-top:1rem">' +
      '<button class="btn btn-primary" onclick="window.startMole()" data-testid="btn-mole-start">Start Game</button>' +
    '</div>' +
    '<div id="mol-done" style="display:none;margin-top:1rem" class="result-overlay">' +
      '<div class="result-title" id="mol-done-title"></div>' +
      '<div class="result-sub" id="mol-done-sub"></div>' +
      '<button class="btn btn-primary" onclick="window.startMole()" data-testid="btn-mole-retry">Play Again</button>' +
    '</div>' +
  '</div>');
}

function initMole() {
  var grid = document.getElementById('mole-grid');
  if (!grid) return;
  grid.innerHTML = Array(9).fill(0).map(function(_, i) {
    return '<div class="mole-hole" data-idx="' + i + '" onclick="whackMole(' + i + ')" data-testid="mole-hole-' + i + '">🕳️</div>';
  }).join('');
  window._mole = { score:0, active:-1, timer:null, countdown:null, timeLeft:30, done:false };
}

window.startMole = function() {
  initMole();
  document.getElementById('mol-start').style.display = 'none';
  document.getElementById('mol-done').style.display = 'none';
  document.getElementById('mol-score').textContent = '0';
  var s = window._mole;
  function popMole() {
    if (!s || s.done) return;
    if (s.active >= 0) {
      var h = document.querySelector('.mole-hole[data-idx="' + s.active + '"]');
      if (h) { h.classList.remove('active'); h.textContent = '🕳️'; }
    }
    var idx = Math.floor(Math.random() * 9);
    s.active = idx;
    var h2 = document.querySelector('.mole-hole[data-idx="' + idx + '"]');
    if (h2) { h2.classList.add('active'); h2.textContent = '🐹'; }
    var delay = Math.max(600, 1200 - s.score * 20);
    s.timer = setTimeout(popMole, delay);
  }
  popMole();
  s.countdown = setInterval(function() {
    s.timeLeft--;
    var el = document.getElementById('mol-time'); if (el) el.textContent = s.timeLeft;
    var bar = document.getElementById('mol-bar'); if (bar) bar.style.width = (s.timeLeft/30*100) + '%';
    if (s.timeLeft <= 0) {
      s.done = true; clearTimeout(s.timer); clearInterval(s.countdown);
      if (s.active >= 0) {
        var h = document.querySelector('.mole-hole[data-idx="' + s.active + '"]');
        if (h) { h.classList.remove('active'); h.textContent = '🕳️'; }
      }
      var best = parseInt(localStorage.getItem('arcade_mole_best')) || 0;
      var nb = s.score > best;
      if (nb) localStorage.setItem('arcade_mole_best', s.score);
      document.getElementById('mol-done').style.display = 'block';
      document.getElementById('mol-done-title').textContent = 'SCORE: ' + s.score;
      document.getElementById('mol-done-sub').textContent = nb ? 'New best!' : '';
      document.getElementById('mol-best').textContent = Math.max(s.score, best);
    }
  }, 1000);
  setCleanup(function() { clearTimeout(s.timer); clearInterval(s.countdown); });
};

window.whackMole = function(idx) {
  var s = window._mole;
  if (!s || s.done) return;
  if (s.active === idx) {
    s.score++;
    document.getElementById('mol-score').textContent = s.score;
    var h = document.querySelector('.mole-hole[data-idx="' + idx + '"]');
    if (h) { h.classList.remove('active'); h.textContent = '⭐'; }
    s.active = -1;
  } else {
    s.score = Math.max(0, s.score - 1);
    document.getElementById('mol-score').textContent = s.score;
  }
};

// ============================================================
// GAME: MATH BLASTER
// ============================================================
function genMathQ(score) {
  var level = score < 10 ? 0 : score < 25 ? 1 : 2;
  var a, b, op, ans;
  if (level === 0) { a = Math.floor(Math.random()*20)+1; b = Math.floor(Math.random()*20)+1; op = '+'; ans = a+b; }
  else if (level === 1) { a = Math.floor(Math.random()*30)+10; b = Math.floor(Math.random()*a)+1; op = '-'; ans = a-b; }
  else { a = Math.floor(Math.random()*12)+2; b = Math.floor(Math.random()*12)+2; op = '×'; ans = a*b; }
  return { a:a, b:b, op:op, ans:ans };
}

function renderMath() {
  var best = localStorage.getItem('arcade_math_best');
  return gameWrapper('MATH BLASTER', '<div style="text-align:center">' +
    '<div style="display:flex;gap:1rem;justify-content:center;margin-bottom:1rem;flex-wrap:wrap">' +
      '<div class="stat-pill"><span class="pill-val" id="mth-score">0</span><span class="pill-label">Score</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="mth-time">60</span><span class="pill-label">Sec Left</span></div>' +
      '<div class="stat-pill"><span class="pill-val" id="mth-best">' + (best || '—') + '</span><span class="pill-label">Best</span></div>' +
    '</div>' +
    '<div class="timer-bar"><div class="timer-fill" id="mth-bar" style="width:100%"></div></div>' +
    '<div id="mth-equation" class="math-equation">— <span class="op">+</span> — <span class="eq">=</span> <span class="answer">?</span></div>' +
    '<div id="mth-feedback" style="min-height:1.5rem;font-family:var(--font-display);font-size:0.65rem;margin-bottom:0.75rem"></div>' +
    '<div style="display:flex;gap:0.75rem;max-width:280px;margin:0 auto 1rem">' +
      '<input type="number" id="mth-input" placeholder="Answer..." data-testid="input-math" style="flex:1" />' +
      '<button class="btn btn-primary" onclick="submitMath()" data-testid="btn-math-submit">Go</button>' +
    '</div>' +
    '<button class="btn btn-secondary" onclick="window.initMath()" data-testid="btn-math-new">New Game</button>' +
    '<div id="mth-done" style="display:none;margin-top:1rem" class="result-overlay">' +
      '<span class="result-emoji">🧮</span>' +
      '<div class="result-title" id="mth-done-title"></div>' +
      '<div class="result-sub" id="mth-done-sub"></div>' +
      '<button class="btn btn-primary" onclick="window.initMath()" data-testid="btn-math-retry">Play Again</button>' +
    '</div>' +
  '</div>');
}

window.initMath = function() {
  if (window._math && window._math.timer) clearInterval(window._math.timer);
  window._math = { score:0, timeLeft:60, timer:null, done:false, q:null };
  document.getElementById('mth-done').style.display = 'none';
  document.getElementById('mth-score').textContent = '0';
  document.getElementById('mth-time').textContent = '60';
  document.getElementById('mth-feedback').textContent = '';
  var inp = document.getElementById('mth-input'); if (inp) { inp.disabled = false; inp.value = ''; inp.focus(); }
  nextMathQ();
  window._math.timer = setInterval(function() {
    var s = window._math; if (!s || s.done) return;
    s.timeLeft--;
    var el = document.getElementById('mth-time'); if (el) el.textContent = s.timeLeft;
    var bar = document.getElementById('mth-bar'); if (bar) { bar.style.width = (s.timeLeft/60*100) + '%'; if (s.timeLeft < 15) bar.classList.add('urgent'); }
    if (s.timeLeft <= 0) endMath();
  }, 1000);
  setCleanup(function() { if (window._math && window._math.timer) clearInterval(window._math.timer); });
};

function nextMathQ() {
  var s = window._math;
  s.q = genMathQ(s.score);
  var eq = document.getElementById('mth-equation');
  if (eq) eq.innerHTML = s.q.a + ' <span class="op">' + s.q.op + '</span> ' + s.q.b + ' <span class="eq">=</span> <span class="answer">?</span>';
}

function endMath() {
  var s = window._math;
  clearInterval(s.timer); s.done = true;
  var inp = document.getElementById('mth-input'); if (inp) inp.disabled = true;
  var best = parseInt(localStorage.getItem('arcade_math_best')) || 0;
  var nb = s.score > best;
  if (nb) localStorage.setItem('arcade_math_best', s.score);
  document.getElementById('mth-done').style.display = 'block';
  document.getElementById('mth-done-title').textContent = 'SCORE: ' + s.score;
  document.getElementById('mth-done-sub').textContent = nb ? 'New best! Lightning fast!' : '';
  var bel = document.getElementById('mth-best'); if (bel) bel.textContent = Math.max(s.score, best);
}

window.submitMath = function() {
  var s = window._math;
  if (!s || s.done || !s.q) return;
  var inp = document.getElementById('mth-input');
  var val = parseInt(inp.value);
  if (isNaN(val)) return;
  var fb = document.getElementById('mth-feedback');
  if (val === s.q.ans) {
    s.score++;
    document.getElementById('mth-score').textContent = s.score;
    if (fb) { fb.style.color = 'var(--green)'; fb.textContent = 'CORRECT!'; }
    inp.value = '';
    nextMathQ();
  } else {
    if (fb) { fb.style.color = 'var(--magenta)'; fb.textContent = 'Wrong! Answer was ' + s.q.ans; }
    inp.value = '';
    setTimeout(function() { if (fb) fb.textContent = ''; nextMathQ(); }, 800);
  }
};

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.getElementById('mth-input') === document.activeElement) window.submitMath();
});
