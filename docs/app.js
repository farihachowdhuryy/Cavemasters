// ============================================================
// TopScore — Shared App JS (nav + Scout AI chatbot)
// ============================================================

(function () {
  // ---- MOBILE NAV ----
  var toggle = document.getElementById('mobileToggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mobileMenu.classList.add('hidden'); });
    });
  }

  // ---- SCOUT AI CHATBOT ----
  var BOT_NAME = 'Cave Dweller';
  var BOT_INTRO = "Hey! I'm CD 🤖, your CaveMaster assistant. Ask me about the games, tips, or anything arcade!";

  var BOT_RESPONSES = [
    {
      triggers: ['hello', 'hi', 'hey', 'sup', 'greetings', 'yo', 'howdy', 'hiya'],
      replies: [
        "Hey there, champion! 🏆 Ready to set some high scores today?",
        "Hello, gamer! I'm Scout, your TopScore AI assistant. What can I help with?",
        "Hey! Welcome to TopScore! Ask me about any game or just say hi anytime 🎮"
      ]
    },
    {
      triggers: ['2048', 'tile', 'tiles', 'merge', 'slide', 'number'],
      replies: [
        "Tile Merge tip 🟧: always anchor your highest tile in a corner and never swipe away from it! Build a descending chain along the edges to set up combos.",
        "Pro move for 2048: use only LEFT + DOWN (or any two directions). Mastering a corner-lock strategy gets you to 2048 much faster! 💡"
      ]
    },
    {
      triggers: ['simon', 'color', 'chain', 'sequence', 'memory', 'pattern'],
      replies: [
        "Color Chain tip 🌈: try saying each color out loud as it flashes — your verbal memory is stronger than your visual memory for sequences!",
        "For Simon Says, the sequence always builds on the last round. Focus on the *new* color added each round instead of re-memorizing the whole thing! 🎵"
      ]
    },
    {
      triggers: ['type', 'typer', 'typing', 'wpm', 'speed', 'words', 'sprint'],
      replies: [
        "Speed Typer tip ⚡: keep your eyes on the text, NOT your hands. Trust your muscle memory and don't stop to correct every mistake — flow beats perfection!",
        "Average WPM is ~40. 60+ is solid. 80+ is great. 100+ is elite typist territory. What's your best? 🏆"
      ]
    },
    {
      triggers: ['quiz', 'trivia', 'question', 'blitz', 'answer'],
      replies: [
        "Quiz Blitz tip 🧠: your first instinct is right most of the time. Don't second-guess yourself. The timer is your biggest enemy — be decisive!",
        "There are 15 carefully picked trivia questions in Quiz Blitz. Can you ace all of them in one run? 📚"
      ]
    },
    {
      triggers: ['mine', 'minesweeper', 'bomb', 'flag', 'sweep', 'grid'],
      replies: [
        "Minesweeper tip 💣: start by clicking corners — they have fewer adjacent cells, so you reveal more info faster. If a number cell already has that many flags next to it, all other neighbors are safe!",
        "Use the Flag Mode button to mark mines on mobile, or right-click on desktop. Never guess when you can deduce! 🚩"
      ]
    },
    {
      triggers: ['score', 'best', 'high score', 'record', 'top', 'save', 'local'],
      replies: [
        "Your scores are saved in your browser's localStorage — they persist between visits! Beat your personal bests in all 5 games to become the ultimate TopScore champion 🏆",
        "High scores are saved locally per game. Look for the 🏆 Best indicator on each game card!"
      ]
    },
    {
      triggers: ['game', 'games', 'play', 'what', 'available', 'list'],
      replies: [
        "TopScore has 5 great games: 🟧 Tile Merge (2048), 🌈 Color Chain (Simon Says), ⚡ Speed Typer, 🧠 Quiz Blitz, and 💣 Minesweeper! Head to the Games page to jump in!"
      ]
    },
    {
      triggers: ['about', 'who', 'creator', 'made', 'topscore', 'developer'],
      replies: [
        "TopScore is a modern browser arcade built for fun and challenge. Visit the About page to learn more about the creator and the story behind TopScore! 👤"
      ]
    },
    {
      triggers: ['contact', 'email', 'reach', 'feedback', 'bug', 'report'],
      replies: [
        "Have feedback or found a bug? Visit the Contact page and drop us a message! Every report helps make TopScore better 📬"
      ]
    },
    {
      triggers: ['thanks', 'thank you', 'thx', 'ty', 'appreciate'],
      replies: [
        "You're welcome, champion! Now go smash those high scores! 🏆",
        "Happy to help! Good luck on your next run 🎮",
        "Anytime! TopScore believes in you 💪"
      ]
    },
    {
      triggers: ['bye', 'goodbye', 'cya', 'later', 'exit', 'quit'],
      replies: [
        "See you on the leaderboard! 🏆 Keep gaming!",
        "Bye! Come back soon and beat those personal bests 🎮"
      ]
    },
    {
      triggers: ['tip', 'tips', 'advice', 'help', 'guide', 'how', 'rules'],
      replies: [
        "I've got tips for all 5 games! Just ask me about: Tile Merge, Color Chain, Speed Typer, Quiz Blitz, or Minesweeper 🎮",
        "Say the name of any game and I'll drop some expert tips for it! Or ask about scores, the site, or anything else 🤖"
      ]
    },
    {
      triggers: ['cool', 'nice', 'awesome', 'great', 'love', 'fun'],
      replies: [
        "Thanks! The TopScore team put a lot of love into these games! 💙",
        "Glad you're enjoying it! TopScore was built to be the best browser arcade around 🏆"
      ]
    }
  ];

  var FALLBACKS = [
    "Hmm, I'm not sure about that! Try asking me about our 5 games or tips 🤔",
    "I specialize in arcade games and tips! Ask me about Tile Merge, Color Chain, Speed Typer, Quiz Blitz, or Minesweeper 🎮",
    "That's outside my playbook! But I can help with game tips, scores, and navigation 🤖",
    "Good question, but I'm just a humble arcade bot! Try asking about the games or your scores 🏆"
  ];

  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function getResponse(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < BOT_RESPONSES.length; i++) {
      var entry = BOT_RESPONSES[i];
      for (var j = 0; j < entry.triggers.length; j++) {
        if (lower.includes(entry.triggers[j])) {
          return pickRandom(entry.replies);
        }
      }
    }
    return pickRandom(FALLBACKS);
  }

  // Inject chat widget HTML
  var chatHTML = '<button class="chat-fab" id="chatFab" aria-label="Open chat">' +
    '💬<span class="chat-badge">1</span></button>' +
    '<div class="chat-window" id="chatWindow">' +
      '<div class="chat-header">' +
        '<div class="chat-bot-avatar">🤖</div>' +
        '<div class="chat-bot-info">' +
          '<div class="chat-bot-name">Cave Dweller — AI Assistant</div>' +
          '<div class="chat-bot-status">Online</div>' +
        '</div>' +
        '<button class="chat-close" id="chatClose">✕</button>' +
      '</div>' +
      '<div class="chat-messages" id="chatMessages"></div>' +
      '<div class="chat-input-row">' +
        '<input type="text" id="chatInput" placeholder="Ask me anything..." maxlength="200" />' +
        '<button class="chat-send" id="chatSend">➤</button>' +
      '</div>' +
    '</div>';

  var chatContainer = document.createElement('div');
  chatContainer.innerHTML = chatHTML;
  document.body.appendChild(chatContainer);

  var fab = document.getElementById('chatFab');
  var chatWindow = document.getElementById('chatWindow');
  var closeBtn = document.getElementById('chatClose');
  var messagesEl = document.getElementById('chatMessages');
  var inputEl = document.getElementById('chatInput');
  var sendBtn = document.getElementById('chatSend');
  var badge = fab.querySelector('.chat-badge');
  var opened = false;

  function appendMsg(text, role) {
    var msgEl = document.createElement('div');
    msgEl.className = 'chat-msg ' + role;
    var bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';
    bubble.textContent = text;
    msgEl.appendChild(bubble);
    messagesEl.appendChild(msgEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    var typing = document.createElement('div');
    typing.className = 'chat-msg bot';
    typing.id = 'chatTyping';
    typing.innerHTML = '<div class="chat-msg-bubble chat-typing">' +
      '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>' +
    '</div>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    var el = document.getElementById('chatTyping');
    if (el) el.remove();
  }

  function botReply(userText) {
    showTyping();
    setTimeout(function () {
      removeTyping();
      appendMsg(getResponse(userText), 'bot');
    }, 900 + Math.random() * 500);
  }

  function sendMessage() {
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    appendMsg(text, 'user');
    botReply(text);
  }

  fab.addEventListener('click', function () {
    opened = !opened;
    chatWindow.classList.toggle('open', opened);
    fab.querySelector('.chat-badge').style.display = 'none';
    if (opened) {
      if (messagesEl.children.length === 0) appendMsg(BOT_INTRO, 'bot');
      setTimeout(function () { inputEl.focus(); }, 50);
    }
  });

  closeBtn.addEventListener('click', function () {
    opened = false;
    chatWindow.classList.remove('open');
  });

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') sendMessage();
  });
})();

// Shared nav setup — runs on every page
(function () {
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('hidden'));
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => menu.classList.add('hidden'));
    });
  }

  // Konami code — site-wide easter egg
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', function(e) {
    if (e.key === KONAMI[pos]) {
      pos++;
      if (pos === KONAMI.length) {
        pos = 0;
        var d = document.createElement('div');
        d.className = 'konami-overlay';
        d.innerHTML = '<div class="konami-msg">CHEAT CODE ACTIVATED!</div>';
        document.body.appendChild(d);
        setTimeout(function() { d.remove(); }, 800);
      }
    } else {
      pos = 0;
    }
  });
})();
