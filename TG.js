// DOM Elements
const wright = document.getElementById("wri");
const wrong = document.getElementById("wro");
const miss = document.getElementById("missed");
const display = document.getElementById("display");
const progress = document.getElementById("prg");
const speed = document.getElementById("range");
const inputField = document.getElementById("inputField");
const startButton = document.getElementById("startBtn");
const resetButton = document.getElementById("resetBtn");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const streakDisplay = document.getElementById("streak");
const levelDisplay = document.getElementById("current-level");
const timeLeft = document.getElementById("time-left");
const scoreList = document.getElementById("score-list");

// Game state
let gameState = {
  isPlaying: false,
  level: 1,
  score: 0,
  streak: 0,
  totalWords: 0,
  correctWords: 0,
  startTime: null,
  timeRemaining: 60,
  wordList: [],
  currentWord: "",
  timer: null,
  progressTimer: null,
  delay: 1000,
  lastWords: [] // Keep track of recent words to prevent repetition
};

// Initialize word lists by difficulty
const wordsByLevel = {
  1: [
    // 3-4 letter simple words
    "cat", "dog", "hat", "run", "jump", "play", "book", "tree", "fish", "bird",
    "ball", "cake", "door", "fire", "game", "hand", "king", "leaf", "milk", "nest",
    "air", "baby", "cold", "dark", "easy", "face", "good", "home", "idea", "join",
    "kind", "love", "moon", "nice", "open", "park", "quit", "rain", "star", "time",
    "use", "view", "walk", "year", "zero", "blue", "free", "grow", "help", "keep",
    "life", "move", "note", "page", "rest", "safe", "talk", "unit", "wait", "yard"
  ],
  2: [
    // 4-6 letter medium words
    "apple", "house", "green", "happy", "water", "music", "dance", "smile", "cloud", "light",
    "beach", "dream", "flame", "grass", "heart", "juice", "pearl", "queen", "river", "snake",
    "bread", "chair", "dream", "earth", "flash", "grape", "honey", "image", "judge", "knife",
    "lemon", "magic", "night", "ocean", "peace", "quiet", "radio", "sheep", "table", "uncle",
    "value", "world", "youth", "bread", "clock", "drink", "eagle", "flour", "ghost", "horse",
    "island", "jewel", "laugh", "money", "nurse", "paint", "quick", "round", "sugar", "tiger"
  ],
  3: [
    // 7-9 letter complex words
    "computer", "elephant", "beautiful", "mountain", "rainbow", "sunshine", "butterfly", "chocolate",
    "adventure", "wonderful", "dinosaur", "favorite", "hospital", "internet", "keyboard", "language",
    "medicine", "painting", "question", "birthday", "calendar", "daughter", "exercise", "festival",
    "grateful", "harmony", "industry", "journey", "kingdom", "library", "morning", "network",
    "opinion", "package", "quality", "reality", "science", "teacher", "uniform", "victory",
    "weather", "amazing", "balance", "captain", "diamond", "evening", "fashion", "gallery",
    "history", "imagine", "justice", "kitchen", "mystery", "natural", "organic", "perfect"
  ],
  4: [
    // 10+ letter challenging words
    "extraordinary", "sophisticated", "determination", "professional", "achievement", "development",
    "opportunity", "imagination", "celebration", "understanding", "conversation", "environment",
    "independent", "technology", "university", "application", "basketball", "confidence",
    "dedication", "efficiency", "friendship", "generation", "happiness", "important",
    "knowledge", "leadership", "management", "necessary", "operation", "performance",
    "qualified", "reference", "successful", "treatment", "valuable", "wonderful",
    "achievement", "background", "collection", "department", "experience", "foundation",
    "government", "historical", "industrial", "journalism", "laboratory", "mechanical",
    "navigation", "obligation", "particular", "reasonable", "scientific", "television"
  ]
};

function getRandomWord() {
  const levelWords = wordsByLevel[gameState.level];
  let newWord;
  
  do {
    newWord = levelWords[Math.floor(Math.random() * levelWords.length)];
  } while (gameState.lastWords.includes(newWord) && gameState.lastWords.length < levelWords.length);
  
  // Update last words list
  gameState.lastWords.push(newWord);
  if (gameState.lastWords.length > 3) {
    gameState.lastWords.shift();
  }
  
  return newWord;
}

function updateDisplay() {
  if (!gameState.currentWord) {
    gameState.currentWord = getRandomWord();
  }
  display.textContent = gameState.currentWord;
  display.classList.add("animate-pop");
  setTimeout(() => display.classList.remove("animate-pop"), 300);
}

function calculateWPM() {
  if (!gameState.startTime) return 0;
  
  const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // in minutes
  if (timeElapsed === 0) return 0;
  
  // Use correctWords from gameState instead of DOM element
  return Math.round(gameState.correctWords / timeElapsed);
}

function calculateAccuracy() {
  if (gameState.totalWords === 0) return 0;
  return Math.round((gameState.correctWords / gameState.totalWords) * 100);
}

function getCurrentLevel() {
  if (gameState.correctWords >= 40) return 'Hard';
  if (gameState.correctWords >= 20) return 'Medium';
  return 'Easy';
}

function updatePlayerStats() {
  const wpm = calculateWPM();
  const accuracy = calculateAccuracy();
  const level = getCurrentLevel();

  document.getElementById('current-wpm').textContent = Math.round(wpm);
  document.getElementById('current-accuracy').textContent = Math.round(accuracy) + '%';
  document.getElementById('current-level').textContent = level;
}

function updateStats() {
  wpmDisplay.textContent = calculateWPM();
  accuracyDisplay.textContent = calculateAccuracy();
  streakDisplay.textContent = gameState.streak;
  levelDisplay.textContent = getCurrentLevel();
}

function startGame() {
  if (!gameState.isPlaying) {
    gameState.isPlaying = true;
    gameState.startTime = Date.now();
    startButton.disabled = true;
    inputField.disabled = false;
    inputField.focus();
    
    startTimer();
    startProgressTimer();
  }
}

function resetGame() {
  clearInterval(gameState.timer);
  clearInterval(gameState.progressTimer);
  
  gameState = {
    isPlaying: false,
    level: 1,
    score: 0,
    streak: 0,
    totalWords: 0,
    correctWords: 0,
    startTime: null,
    timeRemaining: 60,
    wordList: [],
    currentWord: "",
    timer: null,
    progressTimer: null,
    delay: 1000,
    lastWords: []
  };
  
  progress.value = 0;
  wright.textContent = "0";
  wrong.textContent = "0";
  miss.textContent = "0";
  inputField.value = "";
  inputField.disabled = true;
  startButton.disabled = false;
  timeLeft.textContent = "60";
  speed.value = 100;
  
  // Set initial word
  gameState.currentWord = getRandomWord();
  updateDisplay();
  updatePlayerStats();
  updateStats();
}

function startTimer() {
  clearInterval(gameState.timer);
  gameState.timer = setInterval(() => {
    if (gameState.timeRemaining <= 0) {
      endGame();
    } else {
      gameState.timeRemaining--;
      timeLeft.textContent = gameState.timeRemaining;
    }
  }, 1000);
}

function startProgressTimer() {
  progress.value = 0;
  clearInterval(gameState.progressTimer);
  
  gameState.progressTimer = setInterval(() => {
    if (gameState.isPlaying) {
      progress.value += 1;
      if (progress.value >= 100) {
        miss.textContent = parseInt(miss.textContent) + 1;
        gameState.streak = 0;
        gameState.currentWord = getRandomWord();
        updateDisplay();
        progress.value = 0;
        updatePlayerStats();
        updateStats();
        checkGameOver();
      }
    }
  }, gameState.delay / 10);
}

function checkGameOver() {
  if (parseInt(miss.textContent) >= 5 || parseInt(wrong.textContent) >= 5) {
    endGame();
  }
}

function endGame() {
  clearInterval(gameState.timer);
  clearInterval(gameState.progressTimer);
  
  const finalScore = {
    wpm: calculateWPM(),
    accuracy: calculateAccuracy(),
    level: gameState.level
  };
  
  saveHighScore(finalScore);
  
  alert(`Game Over!\nWPM: ${finalScore.wpm}\nAccuracy: ${finalScore.accuracy}%\nLevel: ${finalScore.level}`);
  resetGame();
}

function saveHighScore(score) {
  let highScores = JSON.parse(localStorage.getItem("typingHighScores") || "[]");
  highScores.push(score);
  highScores.sort((a, b) => b.wpm - a.wpm);
  highScores = highScores.slice(0, 5); // Keep top 5 scores
  localStorage.setItem("typingHighScores", JSON.stringify(highScores));
  updateHighScoreDisplay();
}

function updateHighScoreDisplay() {
  const highScores = JSON.parse(localStorage.getItem("typingHighScores") || "[]");
  scoreList.innerHTML = highScores
    .map((score, index) => `
      <li>
        <span class="score-rank">#${index + 1}</span>
        <div class="score-details">
          <span class="score-item">
            <span class="score-label">WPM:</span>
            ${score.wpm}
          </span>
          <span class="score-item">
            <span class="score-label">Accuracy:</span>
            ${score.accuracy}%
          </span>
          <span class="score-item">
            <span class="score-label">Level:</span>
            ${score.level}
          </span>
        </div>
      </li>
    `).join("");
    
  // If no scores yet, show a message
  if (highScores.length === 0) {
    scoreList.innerHTML = '<li class="no-scores">No high scores yet. Start playing to set some records!</li>';
  }
}

// Event Listeners
inputField.addEventListener("keyup", function(e) {
  if (!gameState.isPlaying) return;
  
  if (e.key === "Enter") {
    gameState.totalWords++;
    
    if (inputField.value.trim().toLowerCase() === gameState.currentWord.toLowerCase()) {
      wright.textContent = parseInt(wright.textContent) + 1;
      gameState.correctWords++;
      gameState.streak++;
      
      if (gameState.streak > 0 && gameState.streak % 5 === 0) {
        gameState.level = Math.min(4, gameState.level + 1);
      }
    } else {
      wrong.textContent = parseInt(wrong.textContent) + 1;
      gameState.streak = 0;
    }
    
    inputField.value = "";
    gameState.currentWord = getRandomWord();
    updateDisplay();
    progress.value = 0;
    updatePlayerStats();
    updateStats();
    checkGameOver();
    startProgressTimer();
  }
});

speed.addEventListener("change", function() {
  // Adjust the speed range to be more manageable
  // Now the delay will be between 2000ms (slow) and 500ms (fast)
  gameState.delay = 2000 - (speed.value * 1.5);
  if (gameState.isPlaying) {
    startProgressTimer();
  }
});

startButton.addEventListener("click", startGame);
resetButton.addEventListener("click", resetGame);

// Initialize game
resetGame();
updateHighScoreDisplay();