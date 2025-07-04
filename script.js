const suits = ['Red', 'Green', 'Black', 'Yellow'];
const values = Array.from({ length: 14 }, (_, i) => i + 1); // 1–14 like Rook
let deck = [];

let playerHand = [];
let p1Hand = [];
let p2Hand = [];
let p3Hand = [];
let kitty = [];
let currentRound = 0;
let playerPoints = 0;
let p1Points = 0;
let p2Points = 0;
let p3Points = 0;
let playerTricks = [];
let p1Tricks = [];
let p2Tricks = [];
let p3Tricks = [];
let currentTurn = 0; // 0=player, 1=p1, 2=p2, 3=p3
let trickWinnerIndex = 0; // 0=player, 1=p1, 2=p2, 3=p3
let waitingForNextTrick = false;
let playsThisTrick = 0;

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
  p1Hand = [];
  p2Hand = [];
  p3Hand = [];
  kitty = [];
  
  // Deal in rotation: Player, P1, P2, P3, Kitty (until kitty has 5)
  let kittyCount = 0;
  let currentPlayer = 0; // 0=player, 1=p1, 2=p2, 3=p3, 4=kitty
  
  while (deck.length > 0) {
    const card = deck.shift();
    
    if (currentPlayer === 0) {
      playerHand.push(card);
    } else if (currentPlayer === 1) {
      p1Hand.push(card);
    } else if (currentPlayer === 2) {
      p2Hand.push(card);
    } else if (currentPlayer === 3) {
      p3Hand.push(card);
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
}

function renderAllHands() {
  renderPlayerHand();
  renderP1Hand();
  renderP2Hand();
  renderP3Hand();
}

function updatePlayerHandStats() {
  // Update tricks taken and score in the Your Hand section
  const tricks = playerTricks.length;
  let score = 0;
  for (const trick of playerTricks) {
    for (const card of trick) {
      score += getCardPoints(card);
    }
  }
  const tricksElem = document.getElementById('player-tricks-taken');
  const scoreElem = document.getElementById('player-score');
  if (tricksElem) tricksElem.textContent = tricks;
  if (scoreElem) scoreElem.textContent = score;
}

function renderPlayerHand() {
  const playerDiv = document.getElementById('player-cards');
  playerDiv.innerHTML = '';
  // Sort cards by suit (color) and then by value
  const sortedHand = [...playerHand].sort((a, b) => {
    // First sort by suit (Red, Green, Black, Yellow)
    const suitOrder = { 'Red': 0, 'Green': 1, 'Black': 2, 'Yellow': 3, 'Rook': 4 };
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) {
      return suitDiff;
    }
    // Then sort by value (highest first)
    return b.value - a.value;
  });
  // --- No overlap logic ---
  sortedHand.forEach((card, i) => {
    const div = document.createElement('div');
    div.className = `card ${card.suit.toLowerCase()}`;
    div.setAttribute('data-value', card.value);
    div.setAttribute('data-suit', getSuitSymbol(card.suit));
    div.textContent = card.value;
    div.onclick = () => playCard(playerHand.indexOf(card)); // Use original index for playCard
    // Default margin only
    div.style.left = '';
    div.style.marginLeft = '';
    div.style.marginRight = '';
    div.style.position = '';
    div.style.zIndex = '';
    playerDiv.appendChild(div);
  });
  updatePlayerHandStats();
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

function getCardPoints(card) {
  if (card.value === 14 || card.value === 10 || card.value === 5) {
    return 10;
  }
  return 0;
}

function playCard(index) {
  if (waitingForNextTrick) return;
  if (playsThisTrick >= 4) return;
  const card = playerHand.splice(index, 1)[0];
  displayPlayedCard('player-played', card);
  renderPlayerHand();
  updateGameStats();
  addDebugLog(`You played: ${card.value} of ${card.suit}`);
  playsThisTrick++;
  // Start AI turns
  currentTurn = 1;
  updateLeadIndicator();
  setTimeout(() => aiTurn(), 1000);
  // Disable Next trick button during play
  const nextBtn = document.getElementById('next-trick-btn');
  if (nextBtn) nextBtn.disabled = true;
  if (playsThisTrick === 4) {
    setTimeout(() => resolveTrick(), 500);
  }
}

function aiTurn() {
  if (playsThisTrick >= 4) return;
  let card, playerName, handArray;
  
  switch(currentTurn) {
    case 1:
      card = p1Hand.splice(getLowestCardIndex(p1Hand), 1)[0];
      playerName = 'P1 (Rook)';
      handArray = p1Hand;
      displayPlayedCard('p1-played', card);
      renderP1Hand();
      addDebugLog(`${playerName} played: ${card.value} of ${card.suit}`);
      break;
    case 2:
      card = p2Hand.splice(getHighestCardIndex(p2Hand), 1)[0];
      playerName = 'P2 (Shadow)';
      handArray = p2Hand;
      displayPlayedCard('p2-played', card);
      renderP2Hand();
      addDebugLog(`${playerName} played: ${card.value} of ${card.suit}`);
      break;
    case 3:
      card = p3Hand.splice(getRandomCardIndex(p3Hand), 1)[0];
      playerName = 'P3 (Blitz)';
      handArray = p3Hand;
      displayPlayedCard('p3-played', card);
      renderP3Hand();
      addDebugLog(`${playerName} played: ${card.value} of ${card.suit}`);
      break;
  }
  
  updateGameStatus(`${playerName} played: ${card.value} of ${card.suit}`);
  playsThisTrick++;
  currentTurn++;
  updateLeadIndicator();
  if (currentTurn <= 3) {
    setTimeout(() => aiTurn(), 1000);
  }
  if (playsThisTrick === 4) {
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

function resolveTrick() {
  // Get all played cards
  const playerCard = getPlayedCard('player-played');
  const p1Card = getPlayedCard('p1-played');
  const p2Card = getPlayedCard('p2-played');
  const p3Card = getPlayedCard('p3-played');
  const allCards = [
    { card: playerCard, player: 'You', index: 0 },
    { card: p1Card, player: 'P1 (Rook)', index: 1 },
    { card: p2Card, player: 'P2 (Shadow)', index: 2 },
    { card: p3Card, player: 'P3 (Blitz)', index: 3 }
  ];
  // Find winner (highest card)
  let winner = allCards[0];
  for (let i = 1; i < allCards.length; i++) {
    if (allCards[i].card.value > winner.card.value) {
      winner = allCards[i];
    }
  }
  trickWinnerIndex = winner.index;
  // Collect trick
  const trick = [playerCard, p1Card, p2Card, p3Card];
  switch(winner.player) {
    case 'You':
      playerTricks.push(trick);
      break;
    case 'P1 (Rook)':
      p1Tricks.push(trick);
      break;
    case 'P2 (Shadow)':
      p2Tricks.push(trick);
      break;
    case 'P3 (Blitz)':
      p3Tricks.push(trick);
      break;
  }
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

// Next trick button logic
const nextTrickBtn = document.getElementById('next-trick-btn');
if (nextTrickBtn) {
  nextTrickBtn.onclick = () => {
    if (nextTrickBtn.disabled) return;
    clearPlayedCards();
    currentTurn = trickWinnerIndex;
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
  document.getElementById('p1-played').innerHTML = '';
  document.getElementById('p2-played').innerHTML = '';
  document.getElementById('p3-played').innerHTML = '';
  document.getElementById('player-played').innerHTML = '';
}

function displayPlayedCard(elementId, card) {
  const div = document.getElementById(elementId);
  div.innerHTML = '';
  const cardDiv = document.createElement('div');
  cardDiv.className = `card ${card.suit.toLowerCase()}`;
  cardDiv.setAttribute('data-value', card.value);
  cardDiv.setAttribute('data-suit', getSuitSymbol(card.suit));
  cardDiv.textContent = card.value;
  div.appendChild(cardDiv);
}

function updateGameStatus(message = '') {
  const statusDiv = document.getElementById('game-status');
  const playerCount = playerHand.length;
  const p1Count = p1Hand.length;
  const p2Count = p2Hand.length;
  const p3Count = p3Hand.length;
  
  if (message) {
    statusDiv.textContent = message;
  } else {
    // Calculate current team scores for status
    const playerTotalPoints = playerTricks.reduce((total, trick) => {
      return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
    }, 0);
    
    const p1TotalPoints = p1Tricks.reduce((total, trick) => {
      return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
    }, 0);
    
    const p2TotalPoints = p2Tricks.reduce((total, trick) => {
      return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
    }, 0);
    
    const p3TotalPoints = p3Tricks.reduce((total, trick) => {
      return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
    }, 0);
    
    const yourTeamPoints = playerTotalPoints + p2TotalPoints;
    const opponentTeamPoints = p1TotalPoints + p3TotalPoints;
    
    statusDiv.textContent = `Cards remaining: ${playerCount} | Team Scores - Your Team: ${yourTeamPoints} | Opponent Team: ${opponentTeamPoints}`;
  }
}

function updateGameStats() {
  document.getElementById('hands-remaining').textContent = Math.max(playerHand.length, p1Hand.length, p2Hand.length, p3Hand.length);
  
  // Calculate total points from tricks for each player
  const playerTotalPoints = playerTricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p1TotalPoints = p1Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p2TotalPoints = p2Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p3TotalPoints = p3Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  // Calculate team scores
  const yourTeamPoints = playerTotalPoints + p2TotalPoints;
  const opponentTeamPoints = p1TotalPoints + p3TotalPoints;
  
  // Update individual scores
  document.getElementById('player-points').textContent = playerTotalPoints;
  document.getElementById('p1-points').textContent = p1TotalPoints;
  document.getElementById('p2-points').textContent = p2TotalPoints;
  document.getElementById('p3-points').textContent = p3TotalPoints;
  
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
  let p1TricksCount = p1Tricks.length;
  let p1Score = 0;
  for (const trick of p1Tricks) {
    for (const card of trick) {
      p1Score += getCardPoints(card);
    }
  }
  if (p1TricksElem) p1TricksElem.textContent = p1TricksCount;
  if (p1ScoreElem) p1ScoreElem.textContent = p1Score;
  // P2
  const p2TricksElem = document.getElementById('p2-tricks-taken');
  const p2ScoreElem = document.getElementById('p2-score');
  let p2TricksCount = p2Tricks.length;
  let p2Score = 0;
  for (const trick of p2Tricks) {
    for (const card of trick) {
      p2Score += getCardPoints(card);
    }
  }
  if (p2TricksElem) p2TricksElem.textContent = p2TricksCount;
  if (p2ScoreElem) p2ScoreElem.textContent = p2Score;
  // P3
  const p3TricksElem = document.getElementById('p3-tricks-taken');
  const p3ScoreElem = document.getElementById('p3-score');
  let p3TricksCount = p3Tricks.length;
  let p3Score = 0;
  for (const trick of p3Tricks) {
    for (const card of trick) {
      p3Score += getCardPoints(card);
    }
  }
  if (p3TricksElem) p3TricksElem.textContent = p3TricksCount;
  if (p3ScoreElem) p3ScoreElem.textContent = p3Score;
}

function endGame() {
  const playerScore = 13 - playerHand.length;
  const p1Score = 13 - p1Hand.length;
  const p2Score = 13 - p2Hand.length;
  const p3Score = 13 - p3Hand.length;
  
  // Calculate final points
  const playerFinalPoints = playerTricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p1FinalPoints = p1Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p2FinalPoints = p2Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  const p3FinalPoints = p3Tricks.reduce((total, trick) => {
    return total + trick.reduce((trickPoints, card) => trickPoints + getCardPoints(card), 0);
  }, 0);
  
  // Calculate team scores
  const yourTeamFinalPoints = playerFinalPoints + p2FinalPoints;
  const opponentTeamFinalPoints = p1FinalPoints + p3FinalPoints;
  
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
  
  updateGameStatus(`Game Over! ${teamMessage} Final Scores - Your Team: ${yourTeamFinalPoints} (You: ${playerFinalPoints}, P2: ${p2FinalPoints}) | Opponent Team: ${opponentTeamFinalPoints} (P1: ${p1FinalPoints}, P3: ${p3FinalPoints})`);
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
  const ids = ['lead-player', 'lead-p1', 'lead-p2', 'lead-p3'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  // Determine who leads next (currentTurn)
  let leadId = '';
  switch (currentTurn) {
    case 0:
      leadId = 'lead-player'; break;
    case 1:
      leadId = 'lead-p1'; break;
    case 2:
      leadId = 'lead-p2'; break;
    case 3:
      leadId = 'lead-p3'; break;
  }
  const leadEl = document.getElementById(leadId);
  if (leadEl) leadEl.textContent = '👉';
}

function startGame() {
  currentRound = 0;
  currentTurn = 0;
  playerPoints = 0;
  p1Points = 0;
  p2Points = 0;
  p3Points = 0;
  playerTricks = [];
  p1Tricks = [];
  p2Tricks = [];
  p3Tricks = [];
  buildDeck();
  shuffle(deck);
  dealCards();
  renderAllTricks();
  
  // Clear played cards
  clearPlayedCards();
  clearDebugLog();
  updateKittyPill();
  updateAIStats();
  updateLeadIndicator();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', startGame);

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
