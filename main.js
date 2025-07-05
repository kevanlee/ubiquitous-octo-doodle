const suits = ['Red', 'Green', 'Black', 'Yellow'];
const values = Array.from({ length: 14 }, (_, i) => i + 1); // 1–14 like Rook
let deck = [];

// PLAYER INDEX MAPPING (clockwise):
// 0 = player (You, top)
// 1 = P3 (right)
// 2 = P2 (bottom)
// 3 = P1 (left)

let playerHand = [];
let p3Hand = [];
let p2Hand = [];
let p1Hand = [];
let hands = [playerHand, p3Hand, p2Hand, p1Hand];
let kitty = [];
let currentRound = 0;
let playerPoints = 0;
let p3Points = 0;
let p2Points = 0;
let p1Points = 0;
let playerTricks = [];
let p3Tricks = [];
let p2Tricks = [];
let p1Tricks = [];
let tricksArr = [playerTricks, p3Tricks, p2Tricks, p1Tricks];
let currentTurn = 0; // 0=player, 1=p3, 2=p2, 3=p1
let trickWinnerIndex = 0; // 0=player, 1=p3, 2=p2, 3=p1
let waitingForNextTrick = false;
let playsThisTrick = 0;
let currentLeadColor = '';
let currentTrickLeader = 0; // Track who led the current trick

// DOM mapping for played cards
const playedCardIds = ['player-played', 'p3-played', 'p2-played', 'p1-played'];

// Debug log system
let debugLog = [];
function addDebugLog(message) {
  debugLog.push(message);
  const logDiv = document.getElementById('debug-log');
  if (logDiv) {
    logDiv.innerHTML = debugLog.map(msg => `<p>${msg}</p>`).join('');
    logDiv.scrollTop = logDiv.scrollHeight;
  }
}
function clearDebugLog() {
  debugLog = [];
  const logDiv = document.getElementById('debug-log');
  if (logDiv) logDiv.innerHTML = '';
}

function buildDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  // Add Rook card as special
  deck.push({ suit: 'Rook', value: 0 });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function dealCards() {
  // Shuffle the entire deck first
  shuffle(deck);
  
  // Initialize hands and kitty
  playerHand = [];
  p3Hand = [];
  p2Hand = [];
  p1Hand = [];
  hands = [playerHand, p3Hand, p2Hand, p1Hand];
  kitty = [];
  
  // Deal in rotation: Player, P1, P2, P3, Kitty (until kitty has 5)
  let kittyCount = 0;
  let currentPlayer = 0; // 0=player, 1=p3, 2=p2, 3=p1, 4=kitty
  
  while (deck.length > 0) {
    const card = deck.shift();
    
    if (currentPlayer === 0) {
      playerHand.push(card);
    } else if (currentPlayer === 1) {
      p3Hand.push(card);
    } else if (currentPlayer === 2) {
      p2Hand.push(card);
    } else if (currentPlayer === 3) {
      p1Hand.push(card);
    } else if (currentPlayer === 4 && kittyCount < 5) {
      kitty.push(card);
      kittyCount++;
    }
    
    // Move to next player
    currentPlayer++;
    
    // After dealing to kitty 5 times, skip kitty in rotation
    if (kittyCount >= 5) {
      currentPlayer = currentPlayer % 4; // Only cycle through players 0-3
    } else {
      currentPlayer = currentPlayer % 5; // Cycle through players 0-3 and kitty (4)
    }
  }
  
  renderAllHands();
  updateGameStats();
  updateKittyPill();
  updatePlayerHandStats();
  updateAIStats();
}

function renderAllHands() {
  renderPlayerHand();
  renderP3Hand();
  renderP2Hand();
  renderP1Hand();
}

function updatePlayerHandStats() {
  const tricks = Array.isArray(playerTricks) ? playerTricks.length : 0;
  let score = 0;
  if (Array.isArray(playerTricks)) {
    for (const trick of playerTricks) {
      for (const card of trick) {
        score += getCardPoints(card);
      }
    }
  }
  const tricksElem = document.getElementById('player-tricks-taken');
  const scoreElem = document.getElementById('player-score');
  if (tricksElem) tricksElem.textContent = tricks;
  if (scoreElem) scoreElem.textContent = score;
}

function renderP1Hand() {
  const p1Div = document.getElementById('p1-cards');
  p1Div.innerHTML = '';
  
  // Create stacked card display
  const stackDiv = document.createElement('div');
  stackDiv.className = 'card-stack';
  
  const cardDiv = document.createElement('div');
  cardDiv.className = 'stacked-card';
  cardDiv.textContent = 'P1';
  
  const countDiv = document.createElement('div');
  countDiv.className = 'card-count';
  countDiv.textContent = p1Hand.length;
  
  stackDiv.appendChild(cardDiv);
  stackDiv.appendChild(countDiv);
  p1Div.appendChild(stackDiv);
}

function renderP2Hand() {
  const p2Div = document.getElementById('p2-cards');
  p2Div.innerHTML = '';
  
  const stackDiv = document.createElement('div');
  stackDiv.className = 'card-stack';
  
  const cardDiv = document.createElement('div');
  cardDiv.className = 'stacked-card';
  cardDiv.textContent = 'P2';
  
  const countDiv = document.createElement('div');
  countDiv.className = 'card-count';
  countDiv.textContent = p2Hand.length;
  
  stackDiv.appendChild(cardDiv);
  stackDiv.appendChild(countDiv);
  p2Div.appendChild(stackDiv);
}

function renderP3Hand() {
  const p3Div = document.getElementById('p3-cards');
  p3Div.innerHTML = '';
  
  const stackDiv = document.createElement('div');
  stackDiv.className = 'card-stack';
  
  const cardDiv = document.createElement('div');
  cardDiv.className = 'stacked-card';
  cardDiv.textContent = 'P3';
  
  const countDiv = document.createElement('div');
  countDiv.className = 'card-count';
  countDiv.textContent = p3Hand.length;
  
  stackDiv.appendChild(cardDiv);
  stackDiv.appendChild(countDiv);
  p3Div.appendChild(stackDiv);
}

function renderAllTricks() {
  // No-op: AI trick stack UI removed
}

function getSuitSymbol(suit) {
  const symbols = {
    'Red': '♥',
    'Green': '♠', 
    'Black': '♣',
    'Yellow': '♦',
    'Rook': '🃏'
  };
  return symbols[suit] || suit;
}

// Update getCardPoints to match new point values
function getCardPoints(card) {
  if (card.suit === 'Rook') return 20;
  if (card.value === 1) return 15;
  if (card.value === 14 || card.value === 10) return 10;
  if (card.value === 5) return 5;
  return 0;
}

function playCard(index) {
  if (waitingForNextTrick) return;
  if (playsThisTrick >= 4) return;
  const card = playerHand[index];
  // Enforce following suit for player
  if (playsThisTrick > 0 && currentLeadColor) {
    const hasLeadSuit = playerHand.some(c => c.suit === currentLeadColor);
    if (hasLeadSuit && card.suit !== currentLeadColor) {
      const errElem = document.getElementById('hand-error-msg');
      if (errElem) errElem.textContent = 'You must follow suit!';
      return;
    }
  }
  // Clear error if valid play
  const errElem = document.getElementById('hand-error-msg');
  if (errElem) errElem.textContent = '';
  // Play the card
  playerHand.splice(index, 1);
  displayPlayedCard(playedCardIds[0], card);
  renderPlayerHand();
  updateGameStats();
  addDebugLog(`You played: ${card.value} of ${card.suit}`);
  playsThisTrick++;
  // Set lead color if first play of trick
  if (playsThisTrick === 1) {
    currentLeadColor = card.suit;
    updateLeadColorIndicator();
  }
  currentTurn = 1; // Next: P3
  updateLeadIndicator();
  setTimeout(() => aiTurn(), 1000);
  const nextBtn = document.getElementById('next-trick-btn');
  if (nextBtn) nextBtn.disabled = true;
  if (playsThisTrick === 4) {
    setTimeout(() => resolveTrick(), 500);
  }
}

function aiTurn() {
  if (waitingForNextTrick) return;
  if (playsThisTrick >= 4) return;
  let hand, name, playedId;
  if (currentTurn === 1) {
    hand = p3Hand;
    name = 'P3';
    playedId = playedCardIds[1];
  } else if (currentTurn === 2) {
    hand = p2Hand;
    name = 'P2';
    playedId = playedCardIds[2];
  } else if (currentTurn === 3) {
    hand = p1Hand;
    name = 'P1';
    playedId = playedCardIds[3];
  }
  if (!hand || hand.length === 0) return;
  // Enforce following suit for AI
  let card;
  if (playsThisTrick > 0 && currentLeadColor) {
    const leadSuitCards = hand.filter(c => c.suit === currentLeadColor);
    if (leadSuitCards.length > 0) {
      card = leadSuitCards[0]; // Play the first card of the lead suit (could randomize or use AI logic)
      hand.splice(hand.indexOf(card), 1);
    } else {
      card = hand.shift(); // No lead suit, play first card
    }
  } else {
    card = hand.shift(); // First play of trick
  }
  displayPlayedCard(playedId, card);
  renderAllHands();
  // If this is the first play of the trick, update lead color and re-render player hand
  if (playsThisTrick === 0) {
    currentLeadColor = card.suit;
    updateLeadColorIndicator();
    playsThisTrick++;
    updateLeadIndicator();
    renderPlayerHand(); // Update player hand immediately after AI leads
  } else {
    playsThisTrick++;
    renderPlayerHand();
  }
  updateGameStats();
  addDebugLog(`${name} played: ${card.value} of ${card.suit}`);
  currentTurn = (currentTurn + 1) % 4;
  updateLeadIndicator();
  if (playsThisTrick < 4 && currentTurn !== 0) {
    setTimeout(() => aiTurn(), 1000);
  } else if (playsThisTrick === 4) {
    setTimeout(() => resolveTrick(), 500);
  }
}

function getLowestCardIndex(hand) {
  let lowestIndex = 0;
  for (let i = 1; i < hand.length; i++) {
    if (hand[i].value < hand[lowestIndex].value) {
      lowestIndex = i;
    }
  }
  return lowestIndex;
}

function getHighestCardIndex(hand) {
  let highestIndex = 0;
  for (let i = 1; i < hand.length; i++) {
    if (hand[i].value > hand[highestIndex].value) {
      highestIndex = i;
    }
  }
  return highestIndex;
}

function getRandomCardIndex(hand) {
  return Math.floor(Math.random() * hand.length);
}

// Update trick winner logic in resolveTrick
function resolveTrick() {
  // Get all played cards
  const playerCard = getPlayedCard(playedCardIds[0]);
  const p3Card = getPlayedCard(playedCardIds[1]);
  const p2Card = getPlayedCard(playedCardIds[2]);
  const p1Card = getPlayedCard(playedCardIds[3]);
  const allCards = [
    { card: playerCard, player: 'You', index: 0 },
    { card: p3Card, player: 'P3', index: 1 },
    { card: p2Card, player: 'P2', index: 2 },
    { card: p1Card, player: 'P1', index: 3 }
  ];
  // Find the first card of the lead suit as the initial winner
  let winner = allCards.find(c => c.card.suit === currentLeadColor);
  if (!winner) winner = allCards[0]; // fallback, should not happen
  for (let i = 0; i < allCards.length; i++) {
    if (allCards[i].card.suit === currentLeadColor) {
      if (isCardHigher(allCards[i].card, winner.card)) {
        winner = allCards[i];
      }
    }
  }
  trickWinnerIndex = winner.index;
  // Collect trick
  const trick = [playerCard, p3Card, p2Card, p1Card];
  tricksArr[winner.index].push(trick);
  addDebugLog(`<strong>Trick ${currentRound + 1} winner:</strong> ${winner.player} (${winner.card.value} of ${winner.card.suit})`);
  updateGameStatus(`Round ${currentRound + 1}: ${winner.player} wins!`);
  renderAllTricks();
  updatePlayerHandStats();
  updateAIStats();
  updateKittyPill();
  updateLeadIndicator();
  currentRound++;
  // Prevent further play until next trick
  waitingForNextTrick = true;
  // Enable Next trick button
  const nextBtn = document.getElementById('next-trick-btn');
  if (nextBtn) nextBtn.disabled = false;
  updateGameStats();
  // Check if game is over
  if (playerHand.length === 0) {
    endGame();
  }
}

// Helper: isCardHigher(a, b) for lead suit
function isCardHigher(a, b) {
  // 1 is highest, then 14, 13, ..., 2
  if (a.value === 1 && b.value !== 1) return true;
  if (b.value === 1 && a.value !== 1) return false;
  return a.value > b.value;
}

// Next trick button logic
const nextTrickBtn = document.getElementById('next-trick-btn');
if (nextTrickBtn) {
  nextTrickBtn.onclick = () => {
    if (nextTrickBtn.disabled) return;
    clearPlayedCards();
    currentTurn = trickWinnerIndex;
    currentTrickLeader = currentTurn; // Set new leader for the trick
    updateLeadIndicator();
    waitingForNextTrick = false;
    playsThisTrick = 0;
    nextTrickBtn.disabled = true;
    // If it's an AI's turn, trigger their play
    if (currentTurn !== 0 && playerHand.length > 0) {
      setTimeout(() => aiTurn(), 500);
    }
    // If it's the player's turn, they can play as normal
  };
}

function getPlayedCard(elementId) {
  const div = document.getElementById(elementId);
  const cardDiv = div.querySelector('.card');
  if (!cardDiv) return null;
  
  const value = parseInt(cardDiv.getAttribute('data-value'));
  const suitSymbol = cardDiv.getAttribute('data-suit');
  
  // Convert suit symbol back to suit name
  const suitMap = { '♥': 'Red', '♠': 'Green', '♣': 'Black', '♦': 'Yellow', '🃏': 'Rook' };
  const suit = suitMap[suitSymbol] || suitSymbol;
  
  return { suit, value };
}

function clearPlayedCards() {
  playedCardIds.forEach(id => {
    document.getElementById(id).innerHTML = '';
  });
  // Clear lead color at start of new trick
  currentLeadColor = '';
  updateLeadColorIndicator();
  // Clear error message
  const errElem = document.getElementById('hand-error-msg');
  if (errElem) errElem.textContent = '';
}

function updateGameStatus(message = '') {
  const statusDiv = document.getElementById('game-status');
  const playerCount = playerHand.length;
  const p3Count = p3Hand.length;
  const p2Count = p2Hand.length;
  const p1Count = p1Hand.length;
  
  if (message) {
    statusDiv.textContent = message;
  } else {
    // Calculate current team scores for status
    const playerTotalPoints = playerTricks.reduce((total, trick) => {
      return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
    }, 0);
    
    const p3TotalPoints = p3Tricks.reduce((total, trick) => {
      return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
    }, 0);
    
    const p2TotalPoints = p2Tricks.reduce((total, trick) => {
      return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
    }, 0);
    
    const p1TotalPoints = p1Tricks.reduce((total, trick) => {
      return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
    }, 0);
    
    const yourTeamPoints = playerTotalPoints + p2TotalPoints;
    const opponentTeamPoints = p3TotalPoints + p1TotalPoints;
    
    statusDiv.textContent = `Cards remaining: ${playerCount} | Team Scores - Your Team: ${yourTeamPoints} | Opponent Team: ${opponentTeamPoints}`;
  }
}

function updateGameStats() {
  document.getElementById('hands-remaining').textContent = Math.max(playerHand.length, p3Hand.length, p2Hand.length, p1Hand.length);
  
  // Calculate total points from tricks for each player
  const playerTotalPoints = playerTricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p3TotalPoints = p3Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p2TotalPoints = p2Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p1TotalPoints = p1Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  // Calculate team scores
  const yourTeamPoints = playerTotalPoints + p2TotalPoints;
  const opponentTeamPoints = p3TotalPoints + p1TotalPoints;
  
  // Update individual scores
  document.getElementById('player-points').textContent = playerTotalPoints;
  document.getElementById('p3-points').textContent = p3TotalPoints;
  document.getElementById('p2-points').textContent = p2TotalPoints;
  document.getElementById('p1-points').textContent = p1TotalPoints;
  
  // Update team scores
  document.getElementById('your-team-points').textContent = yourTeamPoints;
  document.getElementById('opponent-team-points').textContent = opponentTeamPoints;
  
  // Placeholder values for future bid/trump functionality
  document.getElementById('current-bid').textContent = '-';
  document.getElementById('trump-suit').textContent = '-';
}

function updateAIStats() {
  // P1
  const p1TricksElem = document.getElementById('p1-tricks-taken');
  const p1ScoreElem = document.getElementById('p1-score');
  let p1TricksCount = Array.isArray(p1Tricks) ? p1Tricks.length : 0;
  let p1Score = 0;
  if (Array.isArray(p1Tricks)) {
    for (const trick of p1Tricks) {
      for (const card of trick) {
        p1Score += getCardPoints(card);
      }
    }
  }
  if (p1TricksElem) p1TricksElem.textContent = p1TricksCount;
  if (p1ScoreElem) p1ScoreElem.textContent = p1Score;

  // P2
  const p2TricksElem = document.getElementById('p2-tricks-taken');
  const p2ScoreElem = document.getElementById('p2-score');
  let p2TricksCount = Array.isArray(p2Tricks) ? p2Tricks.length : 0;
  let p2Score = 0;
  if (Array.isArray(p2Tricks)) {
    for (const trick of p2Tricks) {
      for (const card of trick) {
        p2Score += getCardPoints(card);
      }
    }
  }
  if (p2TricksElem) p2TricksElem.textContent = p2TricksCount;
  if (p2ScoreElem) p2ScoreElem.textContent = p2Score;

  // P3
  const p3TricksElem = document.getElementById('p3-tricks-taken');
  const p3ScoreElem = document.getElementById('p3-score');
  let p3TricksCount = Array.isArray(p3Tricks) ? p3Tricks.length : 0;
  let p3Score = 0;
  if (Array.isArray(p3Tricks)) {
    for (const trick of p3Tricks) {
      for (const card of trick) {
        p3Score += getCardPoints(card);
      }
    }
  }
  if (p3TricksElem) p3TricksElem.textContent = p3TricksCount;
  if (p3ScoreElem) p3ScoreElem.textContent = p3Score;
}

function endGame() {
  const playerScore = 13 - playerHand.length;
  const p3Score = 13 - p3Hand.length;
  const p2Score = 13 - p2Hand.length;
  const p1Score = 13 - p1Hand.length;
  
  // Calculate final points
  const playerFinalPoints = playerTricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p3FinalPoints = p3Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p2FinalPoints = p2Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p1FinalPoints = p1Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  // Calculate team scores
  const yourTeamFinalPoints = playerFinalPoints + p2FinalPoints;
  const opponentTeamFinalPoints = p3FinalPoints + p1FinalPoints;
  
  // Determine team winner
  let winningTeam, teamMessage;
  if (yourTeamFinalPoints > opponentTeamFinalPoints) {
    winningTeam = 'Your Team';
    teamMessage = `Your Team wins! (${yourTeamFinalPoints} vs ${opponentTeamFinalPoints})`;
  } else if (opponentTeamFinalPoints > yourTeamFinalPoints) {
    winningTeam = 'Opponent Team';
    teamMessage = `Opponent Team wins! (${opponentTeamFinalPoints} vs ${yourTeamFinalPoints})`;
  } else {
    winningTeam = 'Tie';
    teamMessage = `It's a tie! (${yourTeamFinalPoints} vs ${opponentTeamFinalPoints})`;
  }
  
  updateGameStatus(`Game Over! ${teamMessage} Final Scores - Your Team: ${yourTeamFinalPoints} (You: ${playerFinalPoints}, P2: ${p2FinalPoints}) | Opponent Team: ${opponentTeamFinalPoints} (P3: ${p3FinalPoints}, P1: ${p1FinalPoints})`);
}

function shuffleHand() {
  shuffle(playerHand);
  renderPlayerHand();
  updateGameStatus('Hand shuffled!');
}

function updateKittyPill() {
  const pill = document.getElementById('kitty-pill');
  if (pill) {
    pill.textContent = `Kitty (${kitty.length})`;
  }
}

function updateLeadIndicator() {
  // Clear all indicators
  document.getElementById('lead-player').textContent = '';
  document.getElementById('lead-p1').textContent = '';
  document.getElementById('lead-p2').textContent = '';
  document.getElementById('lead-p3').textContent = '';
  // Set 🟡 emoji for the leader of the current trick
  if (currentTrickLeader === 0) document.getElementById('lead-player').textContent = '🟡';
  if (currentTrickLeader === 1) document.getElementById('lead-p3').textContent = '🟡';
  if (currentTrickLeader === 2) document.getElementById('lead-p2').textContent = '🟡';
  if (currentTrickLeader === 3) document.getElementById('lead-p1').textContent = '🟡';
  // (Optional) Keep opacity for visual effect
  document.getElementById('lead-player').style.opacity = '0.2';
  document.getElementById('lead-p1').style.opacity = '0.2';
  document.getElementById('lead-p2').style.opacity = '0.2';
  document.getElementById('lead-p3').style.opacity = '0.2';
  if (currentTurn === 0) document.getElementById('lead-player').style.opacity = '1';
  if (currentTurn === 1) document.getElementById('lead-p3').style.opacity = '1';
  if (currentTurn === 2) document.getElementById('lead-p2').style.opacity = '1';
  if (currentTurn === 3) document.getElementById('lead-p1').style.opacity = '1';
}

function updateLeadColorIndicator() {
  const leadColorElem = document.getElementById('lead-color-name');
  if (leadColorElem) {
    leadColorElem.textContent = currentLeadColor ? currentLeadColor : '';
  }
}

function startGame() {
  currentRound = 0;
  currentTurn = 0;
  currentTrickLeader = 0;
  playerPoints = 0;
  p3Points = 0;
  p2Points = 0;
  p1Points = 0;
  playerTricks.length = 0;
  p3Tricks.length = 0;
  p2Tricks.length = 0;
  p1Tricks.length = 0;
  buildDeck();
  shuffle(deck);
  dealCards();
  renderAllTricks();
  
  // Clear played cards
  clearPlayedCards();
  clearDebugLog();
  updateKittyPill();
  updateAIStats();
  updatePlayerHandStats();
  updateLeadIndicator();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', startGame);

// Show New Game modal on page load
window.addEventListener('DOMContentLoaded', () => {
  showNewGameModal();
});

function showNewGameModal() {
  const modal = document.getElementById('new-game-modal');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
      const nameInput = document.getElementById('player-name-input');
      if (nameInput) nameInput.focus();
    }, 100);
  }
}

// Handle Start Game button
const startGameBtn = document.getElementById('start-game-btn');
if (startGameBtn) {
  startGameBtn.onclick = () => {
    const nameInput = document.getElementById('player-name-input');
    const playerName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Your Hand';
    const handTitle = document.querySelector('.player-hand-title');
    if (handTitle) handTitle.textContent = playerName;
    const modal = document.getElementById('new-game-modal');
    if (modal) modal.style.display = 'none';
    // Start dealing animation
    startDealingAnimation();
  };
}

function startDealingAnimation() {
  const overlay = document.getElementById('dealing-overlay');
  if (overlay) overlay.style.display = 'flex';
  let kittyCount = 0;
  let totalCards = 45; // 4x10 + 5 kitty (example, adjust as needed)
  let cardsDealt = 0;
  let kittyPill = document.getElementById('kitty-pill');
  let dealInterval = setInterval(() => {
    cardsDealt++;
    // Simulate adding to kitty every 9th card (example logic)
    if (cardsDealt % 9 === 0 && kittyCount < 5) {
      kittyCount++;
      if (kittyPill) kittyPill.textContent = `Kitty (${kittyCount})`;
    }
    // Animate dots
    const dots = document.getElementById('dealing-dots');
    if (dots) {
      dots.textContent = '.'.repeat((cardsDealt % 3) + 1);
    }
    if (cardsDealt >= totalCards) {
      clearInterval(dealInterval);
      // Strikethrough 'Deal' in tour
      const dealTour = document.getElementById('tour-deal');
      if (dealTour) dealTour.classList.add('completed');
      // Hide overlay
      if (overlay) overlay.style.display = 'none';
      // Show Start of Hand modal and bidding UI
      showBiddingModal();
    }
  }, 60); // 60ms per card for a quick animation
}

function renderBiddingPlayerHand() {
  const handDiv = document.getElementById('bidding-player-cards');
  if (!handDiv) return;
  handDiv.innerHTML = '';
  const sortedHand = [...playerHand].sort((a, b) => {
    const suitOrder = { 'Red': 0, 'Green': 1, 'Black': 2, 'Yellow': 3, 'Rook': 4 };
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) {
      return suitDiff;
    }
    if (a.value === 1 && b.value !== 1) return -1;
    if (b.value === 1 && a.value !== 1) return 1;
    return b.value - a.value;
  });
  sortedHand.forEach((card, i) => {
    const div = document.createElement('div');
    div.className = `card ${card.suit.toLowerCase()}`;
    div.setAttribute('data-value', card.value);
    div.setAttribute('data-suit', getSuitSymbol(card.suit));
    div.textContent = card.value;
    handDiv.appendChild(div);
  });
}

// Allow Enter key to submit in the name input
const nameInput = document.getElementById('player-name-input');
if (nameInput) {
  nameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      startGameBtn.click();
    }
  });
}

// Optionally, show modal again when starting a new game (if you have a new game button)
const newGameBtnModal = document.getElementById('new-game-btn-modal');
if (newGameBtnModal) {
  newGameBtnModal.onclick = showNewGameModal;
}

// Onboarding tour expand/collapse logic
const tourBox = document.querySelector('.onboarding-tour');
const tourToggleBtn = document.getElementById('tour-toggle-btn');
if (tourBox && tourToggleBtn) {
  tourToggleBtn.onclick = () => {
    tourBox.classList.toggle('minimized');
    if (tourBox.classList.contains('minimized')) {
      tourToggleBtn.textContent = '+';
    } else {
      tourToggleBtn.textContent = '–';
    }
  };
}

// Track dealer index (0=You, 1=P3, 2=P2, 3=P1)
let dealerIndex = 0;
let playerNames = ['You', 'P3 (Blitz)', 'P2 (Shadow)', 'P1 (Rook)'];
let biddingState = [];

function assignRandomDealer() {
  dealerIndex = Math.floor(Math.random() * 4);
}

function nextDealer() {
  dealerIndex = (dealerIndex + 1) % 4;
}

function startNewGame() {
  assignRandomDealer();
  // ... other new game logic ...
}

function startNewHand() {
  nextDealer();
  // ... other new hand logic ...
}

function showBiddingModal() {
  // Show modal
  const handModal = document.getElementById('hand-setup-modal');
  if (handModal) handModal.style.display = 'flex';
  // Initialize bidding state
  biddingState = [null, null, null, null];
  renderBiddingTable();
  renderBiddingPlayerHand(); // <-- Ensure hand is visible in modal
  // Start bidding loop
  startBidding();
}

function renderBiddingTable() {
  const tbody = document.getElementById('bidding-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.textContent = playerNames[i];
    if (i === dealerIndex) {
      nameTd.innerHTML += ' <span style="color:#6c3483;font-weight:700;">(Dealer)</span>';
    }
    const bidTd = document.createElement('td');
    bidTd.style.textAlign = 'center';
    bidTd.textContent = biddingState[i] === null ? '' : (biddingState[i] === 'pass' ? 'Pass' : biddingState[i]);
    // Comment out Shoot the Moon column for now
    /*
    const moonTd = document.createElement('td');
    moonTd.style.textAlign = 'center';
    moonTd.textContent = (biddingState[i] === 200) ? '🌙' : '';
    tr.appendChild(moonTd);
    */
    tr.appendChild(nameTd);
    tr.appendChild(bidTd);
    tbody.appendChild(tr);
  }
}

// Simple AI bidding logic
function aiBid(index, minBid) {
  // 50% chance to pass, otherwise random valid bid
  if (Math.random() < 0.5) return 'pass';
  let bid = minBid + 5 * Math.floor(Math.random() * ((200 - minBid) / 5 + 1));
  if (bid > 200) bid = 200;
  return bid;
}

// Bidding loop
let currentBidder = 0;
let currentBid = 0;
let highestBidder = null;
let passes = 0;

function startBidding() {
  // Bidding starts with player to the left of dealer
  currentBidder = (dealerIndex + 1) % 4;
  currentBid = 0;
  highestBidder = null;
  passes = 0;
  biddingState = [null, null, null, null];
  renderBiddingTable();
  biddingTurn();
}

function biddingTurn() {
  renderBiddingTable();
  
  // Check if bidding should end
  // 1. Someone bid 200 (maximum bid)
  if (currentBid === 200 && highestBidder !== null) {
    handleBidWinner(highestBidder);
    return;
  }
  
  // 2. All but one have passed
  if (passes >= 3 && highestBidder !== null) {
    handleBidWinner(highestBidder);
    return;
  }
  
  // If it's the human's turn
  if (currentBidder === 0) {
    document.getElementById('bidding-status').textContent = 'Your turn to bid or pass.';
    document.getElementById('bidding-controls').style.display = '';
    // Set min/max for input
    const input = document.getElementById('player-bid-input');
    if (input) {
      input.min = currentBid === 0 ? 100 : currentBid + 5;
      input.max = 200;
      input.value = '';
      // Update placeholder to show minimum valid bid
      input.placeholder = `Your bid (${input.min}-200)`;
    }
    // Comment out Shoot the Moon checkbox for now
    // const moon = document.getElementById('shoot-moon-checkbox');
    // if (moon) moon.checked = false;
    // Set up event handlers
    document.getElementById('submit-bid-btn').onclick = () => {
      const val = parseInt(input.value, 10);
      if (isNaN(val) || val < input.min || val > 200 || (currentBid !== 0 && val < currentBid + 5)) {
        document.getElementById('bidding-error-msg').textContent = `Bid must be at least ${input.min} and at most 200.`;
        return;
      }
      biddingState[0] = val;
      currentBid = val;
      highestBidder = 0;
      passes = 0;
      document.getElementById('bidding-error-msg').textContent = '';
      nextBidder();
    };
    document.getElementById('pass-bid-btn').onclick = () => {
      biddingState[0] = 'pass';
      passes++;
      document.getElementById('bidding-error-msg').textContent = '';
      nextBidder();
    };
    // Comment out Shoot the Moon functionality for now
    /*
    moon.onchange = () => {
      if (moon.checked) {
        biddingState[0] = 200;
        currentBid = 200;
        highestBidder = 0;
        passes = 0;
        document.getElementById('bidding-error-msg').textContent = '';
        renderBiddingTable();
        document.getElementById('bidding-status').textContent = `${playerNames[0]} shoots the moon!`;
        // End bidding immediately
        // TODO: proceed to kitty/trump phase
      }
    };
    */
  } else {
    // AI turn
    document.getElementById('bidding-controls').style.display = 'none';
    setTimeout(() => {
      let minBid = currentBid === 0 ? 100 : currentBid + 5;
      let aiChoice = aiBid(currentBidder, minBid);
      if (aiChoice === 'pass') {
        biddingState[currentBidder] = 'pass';
        passes++;
      } else {
        biddingState[currentBidder] = aiChoice;
        currentBid = aiChoice;
        highestBidder = currentBidder;
        passes = 0;
      }
      nextBidder();
    }, 900);
  }
}

function nextBidder() {
  currentBidder = (currentBidder + 1) % 4;
  // Skip players who have already passed
  let looped = 0;
  while (biddingState[currentBidder] === 'pass' && looped < 4) {
    currentBidder = (currentBidder + 1) % 4;
    looped++;
  }
  biddingTurn();
}

// Global variables for card selection
let selectedCards = [];
let selectedCardIds = new Set();

function handleBidWinner(winnerIndex) {
  // Show the winner message first
  const handModal = document.getElementById('hand-setup-modal');
  if (handModal) {
    const statusElem = document.getElementById('bidding-status');
    if (statusElem) {
      statusElem.textContent = `${playerNames[winnerIndex]} won the bid at ${currentBid} points!`;
    }
  }
  
  // Wait 1.5 seconds before showing the kitty/trump modal
  setTimeout(() => {
    // Hide the bidding modal
    if (handModal) handModal.style.display = 'none';
    
    // Show the kitty/trump modal
    const kittyModal = document.getElementById('kitty-trump-modal');
    if (kittyModal) kittyModal.style.display = 'flex';
    
    if (winnerIndex === 0) {
      // Human player won - show kitty and hand selection
      showHumanTrumpSelection();
    } else {
      // Computer player won - show computer selection
      showComputerTrumpSelection(winnerIndex);
    }
  }, 1500);
}

function showComputerTrumpSelection(winnerIndex) {
  // Show computer section
  document.getElementById('computer-trump-section').style.display = 'block';
  document.getElementById('human-trump-section').style.display = 'none';
  
  // Update title
  document.getElementById('kitty-modal-title').textContent = `${playerNames[winnerIndex]} Won the Bid`;
  
  // Simulate computer thinking
  setTimeout(() => {
    // Computer chooses trump randomly
    const trumpSuits = ['Red', 'Green', 'Black', 'Yellow'];
    const chosenTrump = trumpSuits[Math.floor(Math.random() * trumpSuits.length)];
    
    // Show result
    document.getElementById('computer-thinking').style.display = 'none';
    document.getElementById('computer-result').style.display = 'block';
    document.getElementById('computer-trump-message').textContent = `${playerNames[winnerIndex]} chose ${chosenTrump} as the power suit.`;
    document.getElementById('begin-play-btn').style.display = 'inline-block';
  }, 2000);
}

function showHumanTrumpSelection() {
  // Show human section
  document.getElementById('computer-trump-section').style.display = 'none';
  document.getElementById('human-trump-section').style.display = 'block';
  
  // Update title
  document.getElementById('kitty-modal-title').textContent = 'You Won the Bid - Select Cards & Trump';
  
  // Render kitty cards
  renderKittyCards();
  
  // Render player hand in modal
  renderModalPlayerHand();
  
  // Reset selection
  selectedCards = [];
  selectedCardIds.clear();
  updateSelectionCounter();
  
  // Set up event listeners
  setupCardSelectionListeners();
  setupTrumpSelectionListener();
}

function renderKittyCards() {
  const kittyDisplay = document.getElementById('kitty-cards-display');
  if (!kittyDisplay) return;
  
  kittyDisplay.innerHTML = '';
  kitty.forEach((card, index) => {
    const div = document.createElement('div');
    div.className = `card ${card.suit.toLowerCase()}`;
    div.setAttribute('data-value', card.value);
    div.setAttribute('data-suit', getSuitSymbol(card.suit));
    div.setAttribute('data-source', 'kitty');
    div.setAttribute('data-index', index);
    div.textContent = card.value;
    div.onclick = () => toggleCardSelection(div, card, `kitty-${index}`);
    kittyDisplay.appendChild(div);
  });
}

function renderModalPlayerHand() {
  const handDisplay = document.getElementById('modal-player-cards');
  if (!handDisplay) return;
  
  handDisplay.innerHTML = '';
  const sortedHand = [...playerHand].sort((a, b) => {
    const suitOrder = { 'Red': 0, 'Green': 1, 'Black': 2, 'Yellow': 3, 'Rook': 4 };
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) return suitDiff;
    if (a.value === 1 && b.value !== 1) return -1;
    if (b.value === 1 && a.value !== 1) return 1;
    return b.value - a.value;
  });
  
  sortedHand.forEach((card, index) => {
    const div = document.createElement('div');
    div.className = `card ${card.suit.toLowerCase()}`;
    div.setAttribute('data-value', card.value);
    div.setAttribute('data-suit', getSuitSymbol(card.suit));
    div.setAttribute('data-source', 'hand');
    div.setAttribute('data-index', index);
    div.textContent = card.value;
    div.onclick = () => toggleCardSelection(div, card, `hand-${index}`);
    handDisplay.appendChild(div);
  });
}

function toggleCardSelection(cardDiv, card, cardId) {
  if (selectedCardIds.has(cardId)) {
    // Deselect card
    selectedCardIds.delete(cardId);
    selectedCards = selectedCards.filter(c => c.id !== cardId);
    cardDiv.classList.remove('selected');
  } else {
    // Select card (if under limit)
    if (selectedCards.length < 5) {
      selectedCardIds.add(cardId);
      selectedCards.push({ ...card, id: cardId });
      cardDiv.classList.add('selected');
    }
  }
  updateSelectionCounter();
  updateConfirmButton();
}

function updateSelectionCounter() {
  const counter = document.getElementById('selection-counter');
  if (counter) {
    counter.textContent = `Selected: ${selectedCards.length}/5`;
  }
}

function updateConfirmButton() {
  const confirmBtn = document.getElementById('confirm-selection-btn');
  const trumpDropdown = document.getElementById('trump-dropdown');
  if (confirmBtn) {
    const trumpSelected = trumpDropdown && trumpDropdown.value !== '';
    confirmBtn.disabled = selectedCards.length !== 5 || !trumpSelected;
  }
}

function setupCardSelectionListeners() {
  // Already set up in render functions
}

function setupTrumpSelectionListener() {
  const trumpDropdown = document.getElementById('trump-dropdown');
  if (trumpDropdown) {
    trumpDropdown.onchange = updateConfirmButton;
  }
  
  const confirmBtn = document.getElementById('confirm-selection-btn');
  if (confirmBtn) {
    confirmBtn.onclick = handleHumanSelection;
  }
}

function handleHumanSelection() {
  const trumpDropdown = document.getElementById('trump-dropdown');
  const chosenTrump = trumpDropdown.value;
  
  // Process the selected cards
  const selectedKittyCards = [];
  const selectedHandCards = [];
  
  // Separate selected cards by source
  selectedCards.forEach(card => {
    if (card.id.startsWith('kitty-')) {
      // This is a kitty card - add to player's hand
      const kittyIndex = parseInt(card.id.split('-')[1]);
      selectedKittyCards.push(kitty[kittyIndex]);
    } else if (card.id.startsWith('hand-')) {
      // This is a hand card - mark for removal
      const handIndex = parseInt(card.id.split('-')[1]);
      selectedHandCards.push({ card: playerHand[handIndex], index: handIndex });
    }
  });
  
  // Add selected kitty cards to player's hand
  selectedKittyCards.forEach(card => {
    playerHand.push(card);
  });
  
  // Remove discarded cards from player's hand (in reverse order to maintain indices)
  selectedHandCards
    .sort((a, b) => b.index - a.index) // Sort by index descending
    .forEach(({ index }) => {
      playerHand.splice(index, 1);
    });
  
  // Clear the kitty since all cards have been processed
  kitty = [];
  
  // Update the UI
  renderAllHands();
  updatePlayerHandStats();
  updateGameStats();
  
  // Store the trump suit for the game
  // TODO: Add a global variable to store trump suit
  
  // Close the modal
  const kittyModal = document.getElementById('kitty-trump-modal');
  if (kittyModal) kittyModal.style.display = 'none';
  
  // Start the actual game
  startActualGame();
}

function startActualGame() {
  // TODO: Implement the actual card game logic
  // For now, just show a message
  addDebugLog('Game started! Trump suit: ' + (document.getElementById('trump-dropdown')?.value || 'None'));
}
