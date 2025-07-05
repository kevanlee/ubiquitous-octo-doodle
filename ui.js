// ui.js
// UI rendering and DOM manipulation functions for the Rook-inspired card game

function renderPlayerHand() {
  const playerDiv = document.getElementById('player-cards');
  playerDiv.innerHTML = '';
  // Sort cards by suit (color) and then by value, with 1s before 14s
  const sortedHand = [...playerHand].sort((a, b) => {
    const suitOrder = { 'Red': 0, 'Green': 1, 'Black': 2, 'Yellow': 3, 'Rook': 4 };
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) {
      return suitDiff;
    }
    // 1 is highest, then 14, 13, ..., 2
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
    div.onclick = () => playCard(playerHand.indexOf(card));
    playerDiv.appendChild(div);
  });
  updatePlayerHandStats();
}

function renderP1Hand() {
  const p1Div = document.getElementById('p1-cards');
  p1Div.innerHTML = '';
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

function updateKittyPill() {
  const pill = document.getElementById('kitty-pill');
  if (pill) {
    pill.textContent = `Kitty (${kitty.length})`;
  }
}

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

function clearPlayedCards() {
  playedCardIds.forEach(id => {
    document.getElementById(id).innerHTML = '';
  });
  // Clear lead color at start of new trick
  currentLeadColor = '';
  updateLeadColorIndicator();
} 