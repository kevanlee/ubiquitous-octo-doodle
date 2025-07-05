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
let currentTrumpSuit = ''; // Track the current trump suit

// AI Players tracking
let currentAIPlayers = null; // Will store the randomly selected AI players

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

function updateDealPill() {
  const pill = document.getElementById('deal-pill');
  if (pill) {
    pill.textContent = `Kitty (5)`;
  }
}

function updateBidPill() {
  const pill = document.getElementById('bid-pill');
  if (pill && highestBidder !== null) {
    pill.textContent = `${getCurrentPlayerName(highestBidder)} at ${currentBid} points`;
  } else if (pill) {
    pill.textContent = '';
  }
}

function updatePowerSuitPill() {
  const pill = document.getElementById('power-suit-pill');
  if (pill && currentTrumpSuit) {
    pill.textContent = currentTrumpSuit;
    
    // Set background color based on suit
    const suitColors = {
      'Red': '#e74c3c',
      'Green': '#27ae60', 
      'Black': '#2c3e50',
      'Yellow': '#f39c12'
    };
    
    if (suitColors[currentTrumpSuit]) {
      pill.style.background = suitColors[currentTrumpSuit];
    }
  } else if (pill) {
    pill.textContent = '';
    pill.style.background = '#e74c3c'; // Reset to default red
  }
}

function updateAIPlayerNames() {
  if (!currentAIPlayers) return;
  
  // Update P1 name and image
  const p1NameElem = document.querySelector('.ai-player.p1 h3');
  if (p1NameElem) {
    p1NameElem.textContent = currentAIPlayers.p1.data.fullName;
    p1NameElem.innerHTML = `${currentAIPlayers.p1.data.image} ${currentAIPlayers.p1.data.fullName}`;
  }
  
  // Update P3 name and image
  const p3NameElem = document.querySelector('.ai-player.p3 h3');
  if (p3NameElem) {
    p3NameElem.textContent = currentAIPlayers.p3.data.fullName;
    p3NameElem.innerHTML = `${currentAIPlayers.p3.data.image} ${currentAIPlayers.p3.data.fullName}`;
  }
  
  // Update team names in the stats section
  const opponentTeamElem = document.querySelector('.team-header:has(#opponent-team-points)');
  if (opponentTeamElem) {
    const teamLabel = opponentTeamElem.querySelector('.stat-label');
    if (teamLabel) {
      teamLabel.textContent = `Opponent Team (${currentAIPlayers.p1.data.fullName} + ${currentAIPlayers.p3.data.fullName}):`;
    }
  }
  
  // Update individual player stats labels
  const p1PointsLabel = document.querySelector('#p1-points').previousElementSibling;
  if (p1PointsLabel) {
    p1PointsLabel.textContent = `${currentAIPlayers.p1.data.fullName} Points:`;
  }
  
  const p3PointsLabel = document.querySelector('#p3-points').previousElementSibling;
  if (p3PointsLabel) {
    p3PointsLabel.textContent = `${currentAIPlayers.p3.data.fullName} Points:`;
  }
  
  // Update New Game modal team members
  const newGameP1Elem = document.querySelector('#new-game-modal .team-column:last-child .team-member:first-child');
  if (newGameP1Elem) {
    newGameP1Elem.innerHTML = `${currentAIPlayers.p1.data.image} ${currentAIPlayers.p1.data.fullName}`;
    console.log('Updated P1 in New Game modal:', currentAIPlayers.p1.data.fullName);
  } else {
    console.log('P1 element not found in New Game modal');
  }
  
  const newGameP2Elem = document.querySelector('#new-game-modal .team-column:first-child .team-member:last-child');
  if (newGameP2Elem) {
    newGameP2Elem.innerHTML = `${currentAIPlayers.p2.data.image} ${currentAIPlayers.p2.data.fullName}`;
    console.log('Updated P2 in New Game modal:', currentAIPlayers.p2.data.fullName);
  } else {
    console.log('P2 element not found in New Game modal');
  }
  
  const newGameP3Elem = document.querySelector('#new-game-modal .team-column:last-child .team-member:last-child');
  if (newGameP3Elem) {
    newGameP3Elem.innerHTML = `${currentAIPlayers.p3.data.image} ${currentAIPlayers.p3.data.fullName}`;
    console.log('Updated P3 in New Game modal:', currentAIPlayers.p3.data.fullName);
  } else {
    console.log('P3 element not found in New Game modal');
  }
}

function getCurrentPlayerName(index) {
  if (!currentAIPlayers) {
    // Fallback to generic names if no AI players selected
    return playerNames[index];
  }
  
  // Map player indices to AI players
  switch (index) {
    case 0: // Player (You)
      return playerNames[0]; // Keep the human player name
    case 1: // P3
      return currentAIPlayers.p3.data.fullName;
    case 2: // P2
      return currentAIPlayers.p2.data.fullName;
    case 3: // P1
      return currentAIPlayers.p1.data.fullName;
    default:
      return playerNames[index];
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
  // Select random AI players for this game
  currentAIPlayers = selectRandomAIPlayers();
  
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
  updateDealPill();
  updateBidPill();
  updatePowerSuitPill();
  updateAIPlayerNames(); // Update UI with AI player names
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
  // Select random AI players for this game
  currentAIPlayers = selectRandomAIPlayers();
  
  const modal = document.getElementById('new-game-modal');
  if (modal) {
    modal.style.display = 'flex';
    // Update AI player names in the modal after a short delay to ensure DOM is ready
    setTimeout(() => {
      updateAIPlayerNames();
    }, 50);
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
  let totalCards = 57; // Rook deck has 57 cards
  let cardsDealt = 0;
  let kittyPill = document.getElementById('kitty-pill');
  let dealPill = document.getElementById('deal-pill');
  let dealInterval = setInterval(() => {
    cardsDealt++;
    // Simulate adding to kitty every 10th card (57 cards = 4x13 + 5 kitty)
    if (cardsDealt % 10 === 0 && kittyCount < 5) {
      kittyCount++;
      if (kittyPill) kittyPill.textContent = `Kitty (${kittyCount})`;
      if (dealPill) dealPill.textContent = `Kitty (${kittyCount})`;
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

// Settings toggle functionality
const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const settingsContent = document.getElementById('settings-content');
if (settingsToggleBtn && settingsContent) {
  settingsToggleBtn.onclick = () => {
    const isExpanded = settingsContent.style.display !== 'none';
    if (isExpanded) {
      settingsContent.style.display = 'none';
      settingsToggleBtn.classList.remove('expanded');
    } else {
      settingsContent.style.display = 'block';
      settingsToggleBtn.classList.add('expanded');
    }
  };
}

// Team name update functionality
const teamNameInput = document.getElementById('team-name-input');
const yourTeamNameDisplay = document.getElementById('your-team-name');
if (teamNameInput && yourTeamNameDisplay) {
  teamNameInput.addEventListener('input', () => {
    const teamName = teamNameInput.value.trim();
    yourTeamNameDisplay.textContent = teamName || 'Your Team Name';
  });
}

// Player name update functionality
const playerNameInput = document.getElementById('player-name-input');
const yourNameDisplay = document.querySelector('.team-member');
if (playerNameInput && yourNameDisplay) {
  playerNameInput.addEventListener('input', () => {
    const playerName = playerNameInput.value.trim();
    yourNameDisplay.textContent = playerName || 'Your name';
  });
}

// Start bidding button functionality
const startBiddingBtn = document.getElementById('start-bidding-btn');
if (startBiddingBtn) {
  startBiddingBtn.onclick = () => {
    startBiddingBtn.disabled = true;
    startBidding();
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
  // Don't start bidding automatically - wait for button click
  clearBiddingLog();
  addBiddingLogEntry('Ready to start bidding. Click "Start the bidding" to begin.', 'info');
}

function renderBiddingTable() {
  const tbody = document.getElementById('bidding-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.textContent = getCurrentPlayerName(i);
    if (i === dealerIndex) {
      nameTd.innerHTML += ' <span style="color:#6c3483;font-weight:700;">(Dealer)</span>';
    }
    const bidTd = document.createElement('td');
    bidTd.style.textAlign = 'center';
    bidTd.textContent = biddingState[i] === null ? '' : (biddingState[i] === 'pass' ? 'Pass' : biddingState[i]);
    tr.appendChild(nameTd);
    tr.appendChild(bidTd);
    tbody.appendChild(tr);
  }
}

function addBiddingLogEntry(message, type = 'info') {
  const logDiv = document.getElementById('bidding-log');
  if (!logDiv) return;
  
  const entry = document.createElement('div');
  entry.className = `bidding-log-entry ${type}`;
  entry.textContent = message;
  logDiv.appendChild(entry);
  logDiv.scrollTop = logDiv.scrollHeight;
}

function clearBiddingLog() {
  const logDiv = document.getElementById('bidding-log');
  if (logDiv) logDiv.innerHTML = '';
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
  updateBidPill(); // Clear the bid pill
  renderBiddingTable();
  clearBiddingLog();
  addBiddingLogEntry(`Bidding starts. ${getCurrentPlayerName(dealerIndex)} is the dealer.`, 'info');
  addBiddingLogEntry(`${getCurrentPlayerName(currentBidder)} goes first.`, 'info');
  biddingTurn();
}

function biddingTurn() {
  renderBiddingTable();
  
  // Check if bidding should end
  // 1. Someone bid 200 (maximum bid)
  if (currentBid === 200 && highestBidder !== null) {
    addBiddingLogEntry(`${getCurrentPlayerName(highestBidder)} bid 200 - bidding ends!`, 'action');
    handleBidWinner(highestBidder);
    return;
  }
  
  // 2. All but one have passed
  if (passes >= 3 && highestBidder !== null) {
    addBiddingLogEntry(`All others have passed. ${getCurrentPlayerName(highestBidder)} wins the bid at ${currentBid}!`, 'action');
    handleBidWinner(highestBidder);
    return;
  }
  
  // 3. Check if everyone except the current highest bidder has passed
  if (highestBidder !== null) {
    const passedPlayers = biddingState.filter((bid, index) => bid === 'pass' && index !== highestBidder).length;
    const totalPlayers = 4;
    if (passedPlayers >= totalPlayers - 1) {
      addBiddingLogEntry(`All others have passed. ${getCurrentPlayerName(highestBidder)} wins the bid at ${currentBid}!`, 'action');
      handleBidWinner(highestBidder);
      return;
    }
  }
  
  // If it's the human's turn
  if (currentBidder === 0) {
    addBiddingLogEntry('Your turn to bid or pass.', 'info');
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
    // Set up event handlers
    document.getElementById('submit-bid-btn').onclick = () => {
      const val = parseInt(input.value, 10);
      if (isNaN(val) || val < input.min || val > 200 || (currentBid !== 0 && val < currentBid + 5)) {
        addBiddingLogEntry(`Invalid bid. Must be at least ${input.min} and at most 200.`, 'error');
        return;
      }
      biddingState[0] = val;
      currentBid = val;
      highestBidder = 0;
      passes = 0;
      updateBidPill();
      addBiddingLogEntry(`You bid ${val}.`, 'action');
      
      // Check if everyone else has already passed
      const otherPlayersPassed = biddingState.slice(1).every(bid => bid === 'pass');
      if (otherPlayersPassed) {
        addBiddingLogEntry(`All others have passed. You win the bid at ${val}!`, 'action');
        handleBidWinner(0);
        return;
      }
      
      nextBidder();
    };
    document.getElementById('pass-bid-btn').onclick = () => {
      biddingState[0] = 'pass';
      passes++;
      addBiddingLogEntry('You pass.', 'action');
      nextBidder();
    };
  } else {
    // AI turn
    document.getElementById('bidding-controls').style.display = 'none';
    setTimeout(() => {
      let minBid = currentBid === 0 ? 100 : currentBid + 5;
      let aiChoice = aiBid(currentBidder, minBid);
      if (aiChoice === 'pass') {
        biddingState[currentBidder] = 'pass';
        passes++;
        addBiddingLogEntry(`${getCurrentPlayerName(currentBidder)} passes.`, 'action');
      } else {
        biddingState[currentBidder] = aiChoice;
        currentBid = aiChoice;
        highestBidder = currentBidder;
        passes = 0;
        updateBidPill();
        addBiddingLogEntry(`${getCurrentPlayerName(currentBidder)} bids ${aiChoice}.`, 'action');
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
      statusElem.textContent = `${getCurrentPlayerName(winnerIndex)} won the bid at ${currentBid} points!`;
    }
  }
  
  // Show the "Next / proceed" button
  const startBiddingBtn = document.getElementById('start-bidding-btn');
  const proceedBtn = document.getElementById('proceed-btn');
  if (startBiddingBtn) startBiddingBtn.style.display = 'none';
  if (proceedBtn) {
    proceedBtn.style.display = 'inline-block';
    proceedBtn.onclick = () => {
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
    };
  }
  
  // Add final log entry
  addBiddingLogEntry(`${getCurrentPlayerName(winnerIndex)} won the bid at ${currentBid} points!`, 'action');
  addBiddingLogEntry('Click "Next / proceed" to continue.', 'info');
}

function showComputerTrumpSelection(winnerIndex) {
  // Show computer section
  document.getElementById('computer-trump-section').style.display = 'block';
  document.getElementById('human-trump-section').style.display = 'none';
  
  // Update title with bid amount
  document.getElementById('kitty-modal-title').textContent = `${getCurrentPlayerName(winnerIndex)} Won the Bid at ${currentBid} Points`;
  
  // Simulate computer looking through kitty first
  setTimeout(() => {
    document.getElementById('computer-thinking').textContent = `${getCurrentPlayerName(winnerIndex)} is looking through the kitty...`;
    document.getElementById('computer-thinking').style.display = 'block';
    
    // Then simulate choosing trump
    setTimeout(() => {
      document.getElementById('computer-thinking').textContent = `${getCurrentPlayerName(winnerIndex)} is choosing power suit...`;
      
      // Computer chooses trump randomly
      const trumpSuits = ['Red', 'Green', 'Black', 'Yellow'];
      const chosenTrump = trumpSuits[Math.floor(Math.random() * trumpSuits.length)];
      
      // Set the trump suit
      currentTrumpSuit = chosenTrump;
      
      // Show result
      setTimeout(() => {
        document.getElementById('computer-thinking').style.display = 'none';
        document.getElementById('computer-result').style.display = 'block';
        document.getElementById('computer-trump-message').textContent = `${getCurrentPlayerName(winnerIndex)} chose ${chosenTrump} as the power suit.`;
        updatePowerSuitPill();
        
        // Show the button and set it up
        const beginPlayBtn = document.querySelector('#kitty-trump-modal #begin-play-btn');
        if (beginPlayBtn) {
          beginPlayBtn.style.display = 'inline-block';
          beginPlayBtn.textContent = "Let's go";
          beginPlayBtn.onclick = () => {
            // Close the modal
            const kittyModal = document.getElementById('kitty-trump-modal');
            if (kittyModal) kittyModal.style.display = 'none';
            
            // Start the actual game
            startActualGame();
          };
          addDebugLog('"Let\'s go" button should now be visible');
        } else {
          addDebugLog('ERROR: begin-play-btn element not found!');
        }
      }, 1000);
    }, 1500);
  }, 500);
}

function showHumanTrumpSelection() {
  // Show human section
  document.getElementById('computer-trump-section').style.display = 'none';
  document.getElementById('human-trump-section').style.display = 'block';
  
  // Update title with bid amount
  document.getElementById('kitty-modal-title').textContent = `You Won the Bid at ${currentBid} Points - Select Cards & Trump`;
  
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
  currentTrumpSuit = chosenTrump;
  updatePowerSuitPill();
  
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
