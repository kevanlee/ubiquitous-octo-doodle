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
}

function renderAllHands() {
  renderPlayerHand();
  renderP3Hand();
  renderP2Hand();
  renderP1Hand();
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
  displayPlayedCard(playedCardIds[0], card);
  renderPlayerHand();
  updateGameStats();
  addDebugLog(`You played: ${card.value} of ${card.suit}`);
  playsThisTrick++;
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
  const card = hand.shift();
  displayPlayedCard(playedId, card);
  renderAllHands();
  updateGameStats();
  addDebugLog(`${name} played: ${card.value} of ${card.suit}`);
  playsThisTrick++;
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
  // Find winner (highest card)
  let winner = allCards[0];
  for (let i = 1; i < allCards.length; i++) {
    if (allCards[i].card.value > winner.card.value) {
      winner = allCards[i];
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
  playedCardIds.forEach(id => {
    document.getElementById(id).innerHTML = '';
  });
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
  document.getElementById('lead-player').style.opacity = '0.2';
  document.getElementById('lead-p1').style.opacity = '0.2';
  document.getElementById('lead-p2').style.opacity = '0.2';
  document.getElementById('lead-p3').style.opacity = '0.2';
  if (currentTurn === 0) document.getElementById('lead-player').style.opacity = '1';
  if (currentTurn === 1) document.getElementById('lead-p3').style.opacity = '1';
  if (currentTurn === 2) document.getElementById('lead-p2').style.opacity = '1';
  if (currentTurn === 3) document.getElementById('lead-p1').style.opacity = '1';
}

function startGame() {
  currentRound = 0;
  currentTurn = 0;
  playerPoints = 0;
  p3Points = 0;
  p2Points = 0;
  p1Points = 0;
  playerTricks = [];
  p3Tricks = [];
  p2Tricks = [];
  p1Tricks = [];
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
