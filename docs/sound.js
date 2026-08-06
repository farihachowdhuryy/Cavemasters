// ============================================================
// NEON ARCADE — SOUND SYSTEM
// Pure Web Audio API — no external files required
// ============================================================
(function () {
  'use strict';

  var AC, masterVol, musicVol, sfxVol;
  var _muted = localStorage.getItem('arc_mute') === '1';
  var _musicTimer = null;
  var _loopNodes = [];
  var _loopPos = 0;
  var _currentTrack = 0;
  var _beatTime = 0;
  var _playing = false;
  var LOOKAHEAD = 0.25;
  var TICK_MS = 70;

  function getAC() {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      masterVol = AC.createGain();
      masterVol.gain.value = _muted ? 0 : 0.75;
      masterVol.connect(AC.destination);
      musicVol = AC.createGain();
      musicVol.gain.value = 0.30;
      musicVol.connect(masterVol);
      sfxVol = AC.createGain();
      sfxVol.gain.value = 0.55;
      sfxVol.connect(masterVol);
    }
    return AC;
  }

  // ---- SFX helpers ----
  function tone(freq, type, delay, dur, vol, dest) {
    var ac = getAC();
    var osc = ac.createOscillator();
    var g = ac.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    osc.connect(g);
    g.connect(dest || sfxVol);
    var t = ac.currentTime + (delay || 0);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(vol || 0.3, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function noiseHit(delay, dur, freq, vol) {
    var ac = getAC();
    var len = Math.ceil(ac.sampleRate * dur);
    var buf = ac.createBuffer(1, len, ac.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = ac.createBufferSource();
    src.buffer = buf;
    var filt = ac.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = freq || 300;
    var g = ac.createGain();
    src.connect(filt); filt.connect(g); g.connect(sfxVol);
    var t = ac.currentTime + (delay || 0);
    g.gain.setValueAtTime(vol || 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.start(t); src.stop(t + dur + 0.01);
  }

  // ---- SFX library ----
  window.SFX = {
    ui:       function () { tone(900, 'square', 0, 0.06, 0.22); tone(1200, 'square', 0.05, 0.05, 0.16); },
    coin:     function () { tone(987, 'square', 0, 0.07, 0.3); tone(1319, 'square', 0.08, 0.1, 0.32); tone(1760, 'square', 0.16, 0.14, 0.35); },
    win:      function () { [523,659,784,1047,1319].forEach(function(f,i){tone(f,'square',i*0.1,0.2,0.4);}); },
    lose:     function () { [350,280,220,160].forEach(function(f,i){tone(f,'sawtooth',i*0.1,0.16,0.32);}); },
    correct:  function () { tone(880,'square',0,0.08,0.3); tone(1100,'square',0.09,0.13,0.35); },
    wrong:    function () { tone(160,'sawtooth',0,0.25,0.38); noiseHit(0.03,0.12,180,0.22); },
    place:    function () { tone(440,'square',0,0.07,0.25); tone(560,'square',0.04,0.06,0.2); },
    clear:    function () { [523,784,1047,1568].forEach(function(f,i){tone(f,'square',i*0.07,0.16,0.45);}); },
    chess:    function () { tone(330,'square',0,0.06,0.22); },
    eat:      function () { tone(600,'square',0,0.06,0.3); tone(800,'square',0.06,0.07,0.3); },
    whack:    function () { noiseHit(0,0.09,250,0.42); tone(200,'sawtooth',0.02,0.1,0.28); },
    prestige: function () { [523,659,784,1047,1319,1568,2093].forEach(function(f,i){tone(f,'square',i*0.09,0.18,0.5);}); },
    nav:      function () { tone(660,'square',0,0.05,0.18); },
    start:    function () { [440,550,660,880].forEach(function(f,i){tone(f,'square',i*0.08,0.15,0.3);}); },
    bounce:   function () { tone(520,'square',0,0.05,0.28); },
    brick:    function () { tone(660,'square',0,0.04,0.22); tone(880,'square',0.03,0.05,0.18); }
  };

  window.sfx = function (name) {
    try { if (!_muted && window.SFX && window.SFX[name]) window.SFX[name](); } catch (e) {}
  };

  // ---- MUSIC ----
  function mf(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  // Three hype modern chiptune tracks
  var TRACKS = [
    // SYNTH SURGE — 162 BPM, E major, bright ascending arpeggios
    { name: 'SYNTH SURGE', bpm: 162,
      ch: [
        { type:'sawtooth', vol:0.09, n:[
            76,80,83,88, 87,83,80,76, 74,78,81,86, 85,81,78,74,
            73,76,80,85, 83,80,76,73, 71,75,78,83, 82,78,75,71
          ]},
        { type:'square',   vol:0.13, n:[
            52,52,59,64, 52,52,59,64, 50,50,57,62, 50,50,57,62,
            49,49,56,61, 49,49,56,61, 47,47,54,59, 47,47,54,59
          ]},
        { type:'triangle', vol:0.05, n:[
            68,71,75,80, 75,71,68,64, 66,69,73,78, 73,69,66,62,
            65,68,73,78, 73,68,65,61, 63,66,71,75, 71,66,63,59
          ]}
      ]
    },
    // PIXEL RUSH — 182 BPM, A minor, punchy synth riff
    { name: 'PIXEL RUSH', bpm: 182,
      ch: [
        { type:'square',   vol:0.11, n:[
            81,84,81,79, 81,84,86,84, 79,81,79,76, 79,81,83,81,
            76,79,76,74, 76,79,81,79, 74,76,74,72, 71,72,74,76
          ]},
        { type:'sawtooth', vol:0.10, n:[
            57,60,57,64, 57,60,57,64, 55,58,55,62, 55,58,55,62,
            53,57,53,60, 53,57,53,60, 52,55,52,59, 52,55,52,59
          ]},
        { type:'triangle', vol:0.05, n:[
            69,72,76,81, 79,76,72,69, 67,71,74,79, 77,74,71,67,
            65,69,72,77, 74,72,69,65, 64,67,71,76, 74,71,67,64
          ]}
      ]
    },
    // HYPER DRIVE — 196 BPM, chromatic descent + ascent, max hype
    { name: 'HYPER DRIVE', bpm: 196,
      ch: [
        { type:'square',   vol:0.12, n:[
            76,75,73,71, 70,68,67,65, 64,65,67,68, 70,71,73,75,
            76,78,80,81, 83,84,86,84, 83,81,80,78, 77,76,74,72
          ]},
        { type:'sawtooth', vol:0.10, n:[
            52,55,52,55, 50,53,50,53, 48,52,48,52, 46,50,46,50,
            45,48,45,48, 43,47,43,47, 41,45,41,45, 40,43,40,43
          ]},
        { type:'triangle', vol:0.05, n:[
            64,67,64,60, 64,67,64,60, 62,65,62,58, 62,65,62,58,
            60,64,60,57, 60,64,60,57, 59,62,59,55, 59,62,59,55
          ]}
      ]
    }
  ];

  function stopMusic() {
    if (_musicTimer) { clearInterval(_musicTimer); _musicTimer = null; }
    _loopNodes.forEach(function (n) { try { n.stop(getAC().currentTime + 0.05); } catch (e) {} });
    _loopNodes = [];
    _loopPos = 0;
    _playing = false;
  }

  function scheduleMusicTick() {
    if (!_playing) return;
    var ac = getAC();
    var track = TRACKS[_currentTrack];
    var beatDur = 60 / track.bpm;
    var total = track.ch[0].n.length;
    while (_beatTime < ac.currentTime + LOOKAHEAD) {
      var pos = _loopPos % total;
      track.ch.forEach(function (ch) {
        var n = ch.n[pos];
        if (!n) { _loopPos++; _beatTime += beatDur; return; }
        var osc = ac.createOscillator();
        var g = ac.createGain();
        osc.type = ch.type;
        osc.frequency.value = mf(n);
        osc.connect(g); g.connect(musicVol);
        var t = _beatTime;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(ch.vol, t + 0.007);
        g.gain.setValueAtTime(ch.vol * 0.6, t + beatDur * 0.5);
        g.gain.exponentialRampToValueAtTime(0.001, t + beatDur * 0.88);
        osc.start(t); osc.stop(t + beatDur + 0.02);
        _loopNodes.push(osc);
      });
      _loopPos++;
      _beatTime += beatDur;
      if (_loopNodes.length > 100) _loopNodes.splice(0, 40);
    }
  }

  function startTrack(idx) {
    stopMusic();
    _currentTrack = (idx !== undefined ? idx : _currentTrack) % TRACKS.length;
    _loopPos = 0;
    _playing = true;
    _beatTime = getAC().currentTime + 0.05;
    scheduleMusicTick();
    _musicTimer = setInterval(scheduleMusicTick, TICK_MS);
    _updateUI();
  }

  function _updateUI() {
    var tn = document.getElementById('arc-track-name');
    if (tn) tn.textContent = TRACKS[_currentTrack].name;
    var btn = document.getElementById('arc-mute-btn');
    if (btn) btn.textContent = _muted ? '🔇' : '🔊';
  }

  window.MUSIC = {
    play:  function (idx) { if (!_muted) startTrack(idx !== undefined ? idx : 0); },
    stop:  stopMusic,
    next:  function () {
      var n = (_currentTrack + 1) % TRACKS.length;
      _currentTrack = n;
      if (!_muted) startTrack(n); else _updateUI();
    },
    name:  function () { return TRACKS[_currentTrack].name; }
  };

  window.arcToggleMute = function () {
    _muted = !_muted;
    localStorage.setItem('arc_mute', _muted ? '1' : '0');
    if (AC && masterVol) masterVol.gain.setTargetAtTime(_muted ? 0 : 0.75, AC.currentTime, 0.1);
    if (_muted) stopMusic(); else startTrack(_currentTrack);
    _updateUI();
  };

  window.arcNextTrack = function () { MUSIC.next(); };

  // Inject floating sound bar (LEFT side)
  function injectSoundBar() {
    if (document.getElementById('arc-sound-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'arc-sound-bar';
    bar.innerHTML =
      '<button id="arc-mute-btn" onclick="arcToggleMute()" title="Mute / Unmute">' + (_muted ? '🔇' : '🔊') + '</button>' +
      '<button id="arc-next-btn" onclick="arcNextTrack()" title="Next Track">⏭</button>' +
      '<span id="arc-track-name">' + TRACKS[_currentTrack].name + '</span>';
    document.body.appendChild(bar);
  }

  var _booted = false;
  function boot() {
    if (_booted) return;
    _booted = true;
    injectSoundBar();
    if (!_muted) startTrack(Math.floor(Math.random() * TRACKS.length));
    else _updateUI();
  }
  ['click', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, boot, { once: true, passive: true });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSoundBar);
  } else {
    injectSoundBar();
  }

})();
