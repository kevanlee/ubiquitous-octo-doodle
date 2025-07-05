// AI Players Roster
// This file contains all computer player personalities, strategies, and characteristics

const AI_PLAYERS = {
  // Player 1 personalities
  p1: {
    "Rook": {
      name: "Rook",
      firstName: "Reginald",
      lastName: "Rooksworth",
      fullName: "Reginald Rooksworth",
      personality: "Calculating and strategic",
      description: "A master tactician who carefully analyzes every move. Prefers high-value cards and conservative bidding.",
      image: "🦅", // Eagle emoji for Rook
      quotes: {
        bidding: [
          "Let me assess the situation...",
          "I see potential in this hand.",
          "A calculated risk is still a risk.",
          "The odds are in my favor."
        ],
        playing: [
          "Every card tells a story.",
          "Timing is everything.",
          "I've been waiting for this moment.",
          "Your move, but I'm three steps ahead."
        ],
        winning: [
          "As expected.",
          "The game was won before it began.",
          "Strategy over luck, every time.",
          "A master never reveals all their secrets."
        ],
        losing: [
          "Interesting... I'll remember this.",
          "Even the best plans can fail.",
          "A setback is just a setup for a comeback.",
          "The game isn't over until it's over."
        ]
      },
      strategies: {
        bidding: {
          style: "conservative",
          minBidThreshold: 0.7, // 70% confidence to bid
          maxBidAmount: 160,
          bluffFrequency: 0.2
        },
        playing: {
          style: "calculated",
          riskTolerance: 0.3,
          trumpUsage: "strategic",
          cardCounting: true,
          memory: "excellent"
        }
      },
      playingStyle: {
        aggression: 0.4,
        conservatism: 0.8,
        adaptability: 0.6,
        bluffing: 0.3,
        teamwork: 0.5
      }
    },
    
    "Shadow": {
      name: "Shadow",
      firstName: "Silas",
      lastName: "Shadowmire",
      fullName: "Silas Shadowmire",
      personality: "Mysterious and unpredictable",
      description: "A player who thrives on misdirection and surprise tactics. Hard to read and even harder to predict.",
      image: "👤", // Shadow figure emoji
      quotes: {
        bidding: [
          "The shadows hold many secrets...",
          "You think you know what I'm thinking?",
          "Sometimes the best bid is no bid at all.",
          "Let the darkness guide my hand."
        ],
        playing: [
          "You never see the knife that cuts you.",
          "I move like the wind - unpredictable.",
          "Your confidence will be your downfall.",
          "The shadows always have the last laugh."
        ],
        winning: [
          "The darkness prevails.",
          "You never stood a chance.",
          "The shadows never lose.",
          "Your light was no match for my darkness."
        ],
        losing: [
          "Even shadows can be cast aside.",
          "The light... it burns.",
          "I'll return stronger from the darkness.",
          "This defeat only makes me more dangerous."
        ]
      },
      strategies: {
        bidding: {
          style: "unpredictable",
          minBidThreshold: 0.4,
          maxBidAmount: 200,
          bluffFrequency: 0.8
        },
        playing: {
          style: "deceptive",
          riskTolerance: 0.7,
          trumpUsage: "surprise",
          cardCounting: false,
          memory: "selective"
        }
      },
      playingStyle: {
        aggression: 0.8,
        conservatism: 0.2,
        adaptability: 0.9,
        bluffing: 0.9,
        teamwork: 0.3
      }
    },
    
    "Blitz": {
      name: "Blitz",
      firstName: "Bolt",
      lastName: "Blitzkrieg",
      fullName: "Bolt Blitzkrieg",
      personality: "Aggressive and fast-paced",
      description: "A high-energy player who loves to bid high and play aggressively. Speed and pressure are their weapons.",
      image: "⚡", // Lightning bolt emoji
      quotes: {
        bidding: [
          "Let's make this interesting!",
          "I'm feeling lucky today!",
          "Speed kills, and I'm lightning fast!",
          "Time to turn up the heat!"
        ],
        playing: [
          "Fast and furious!",
          "No time to think, just play!",
          "I'll blitz through this hand!",
          "Speed is my middle name!"
        ],
        winning: [
          "Lightning strikes again!",
          "Speed wins every time!",
          "Too fast for you to handle!",
          "The blitz never fails!"
        ],
        losing: [
          "Even lightning can be grounded.",
          "Speed isn't everything...",
          "I'll be back faster than ever!",
          "The storm isn't over yet!"
        ]
      },
      strategies: {
        bidding: {
          style: "aggressive",
          minBidThreshold: 0.3,
          maxBidAmount: 200,
          bluffFrequency: 0.6
        },
        playing: {
          style: "fast",
          riskTolerance: 0.8,
          trumpUsage: "immediate",
          cardCounting: false,
          memory: "short"
        }
      },
      playingStyle: {
        aggression: 0.9,
        conservatism: 0.1,
        adaptability: 0.4,
        bluffing: 0.7,
        teamwork: 0.6
      }
    }
  },
  
  // Player 2 personalities
  p2: {
    "Shadow": {
      name: "Shadow",
      firstName: "Silas",
      lastName: "Shadowmire",
      fullName: "Silas Shadowmire",
      personality: "Mysterious and unpredictable",
      description: "A player who thrives on misdirection and surprise tactics. Hard to read and even harder to predict.",
      image: "👤", // Shadow figure emoji
      quotes: {
        bidding: [
          "The shadows hold many secrets...",
          "You think you know what I'm thinking?",
          "Sometimes the best bid is no bid at all.",
          "Let the darkness guide my hand."
        ],
        playing: [
          "You never see the knife that cuts you.",
          "I move like the wind - unpredictable.",
          "Your confidence will be your downfall.",
          "The shadows always have the last laugh."
        ],
        winning: [
          "The darkness prevails.",
          "You never stood a chance.",
          "The shadows never lose.",
          "Your light was no match for my darkness."
        ],
        losing: [
          "Even shadows can be cast aside.",
          "The light... it burns.",
          "I'll return stronger from the darkness.",
          "This defeat only makes me more dangerous."
        ]
      },
      strategies: {
        bidding: {
          style: "unpredictable",
          minBidThreshold: 0.4,
          maxBidAmount: 200,
          bluffFrequency: 0.8
        },
        playing: {
          style: "deceptive",
          riskTolerance: 0.7,
          trumpUsage: "surprise",
          cardCounting: false,
          memory: "selective"
        }
      },
      playingStyle: {
        aggression: 0.8,
        conservatism: 0.2,
        adaptability: 0.9,
        bluffing: 0.9,
        teamwork: 0.3
      }
    },
    
    "Swift": {
      name: "Swift",
      firstName: "Samantha",
      lastName: "Swiftwind",
      fullName: "Samantha Swiftwind",
      personality: "Quick and efficient",
      description: "A player who values speed and efficiency. Makes decisions quickly and adapts to changing situations.",
      image: "💨", // Wind emoji
      quotes: {
        bidding: [
          "Time is of the essence.",
          "Quick decisions, better results.",
          "I don't need time to think.",
          "Speed is my advantage."
        ],
        playing: [
          "Fast and efficient.",
          "No time to waste.",
          "I'll finish this quickly.",
          "Swift as the wind."
        ],
        winning: [
          "Efficiency wins again.",
          "Speed and precision.",
          "Quick victory.",
          "Time well spent."
        ],
        losing: [
          "Even the swift can stumble.",
          "Speed isn't everything.",
          "I'll be faster next time.",
          "Time to regroup."
        ]
      },
      strategies: {
        bidding: {
          style: "quick",
          minBidThreshold: 0.5,
          maxBidAmount: 180,
          bluffFrequency: 0.3
        },
        playing: {
          style: "efficient",
          riskTolerance: 0.6,
          trumpUsage: "quick",
          cardCounting: true,
          memory: "good"
        }
      },
      playingStyle: {
        aggression: 0.6,
        conservatism: 0.4,
        adaptability: 0.8,
        bluffing: 0.4,
        teamwork: 0.7
      }
    },
    
    "Steady": {
      name: "Steady",
      firstName: "Stanley",
      lastName: "Steadfast",
      fullName: "Stanley Steadfast",
      personality: "Reliable and consistent",
      description: "A player who values consistency and reliability. Makes steady, predictable moves that build up over time.",
      image: "🛡️", // Shield emoji
      quotes: {
        bidding: [
          "Steady as she goes.",
          "Consistency is key.",
          "I'll hold my ground.",
          "Reliable as always."
        ],
        playing: [
          "Steady progress.",
          "Consistent play.",
          "I'll maintain my course.",
          "Steady wins the race."
        ],
        winning: [
          "Consistency pays off.",
          "Steady as always.",
          "Reliability wins.",
          "Steady hand, steady victory."
        ],
        losing: [
          "Even the steady can falter.",
          "Consistency isn't enough.",
          "I'll stay steady.",
          "Steady improvement needed."
        ]
      },
      strategies: {
        bidding: {
          style: "consistent",
          minBidThreshold: 0.6,
          maxBidAmount: 160,
          bluffFrequency: 0.2
        },
        playing: {
          style: "reliable",
          riskTolerance: 0.4,
          trumpUsage: "consistent",
          cardCounting: true,
          memory: "excellent"
        }
      },
      playingStyle: {
        aggression: 0.3,
        conservatism: 0.8,
        adaptability: 0.5,
        bluffing: 0.2,
        teamwork: 0.9
      }
    }
  },
  
  // Player 3 personalities
  p3: {
    "Mystic": {
      name: "Mystic",
      firstName: "Mystica",
      lastName: "Moonwhisper",
      fullName: "Mystica Moonwhisper",
      personality: "Intuitive and spiritual",
      description: "A player who relies on intuition and 'reading the cards'. Believes in fate and the flow of the game.",
      image: "🔮", // Crystal ball emoji
      quotes: {
        bidding: [
          "The cards speak to me...",
          "I sense great potential here.",
          "The universe guides my hand.",
          "Destiny calls for a bold move."
        ],
        playing: [
          "The cards reveal their secrets.",
          "I follow the path the cards show me.",
          "Intuition never lies.",
          "The mystical forces are with me."
        ],
        winning: [
          "The cards foretold this victory.",
          "Destiny cannot be denied.",
          "The mystical forces prevail.",
          "The future was written in the cards."
        ],
        losing: [
          "Even the stars can be wrong.",
          "The cards were silent today.",
          "Destiny takes unexpected turns.",
          "The mystical path is not always clear."
        ]
      },
      strategies: {
        bidding: {
          style: "intuitive",
          minBidThreshold: 0.5,
          maxBidAmount: 180,
          bluffFrequency: 0.4
        },
        playing: {
          style: "flow",
          riskTolerance: 0.5,
          trumpUsage: "intuitive",
          cardCounting: true,
          memory: "intuitive"
        }
      },
      playingStyle: {
        aggression: 0.5,
        conservatism: 0.5,
        adaptability: 0.7,
        bluffing: 0.4,
        teamwork: 0.8
      }
    },
    
    "Titan": {
      name: "Titan",
      firstName: "Thaddeus",
      lastName: "Thunderfist",
      fullName: "Thaddeus Thunderfist",
      personality: "Powerful and dominant",
      description: "A player who believes in overwhelming force and dominance. Prefers to win through sheer power and intimidation.",
      image: "🏛️", // Greek temple emoji
      quotes: {
        bidding: [
          "I am the master of this game!",
          "None can challenge my authority!",
          "I will crush all opposition!",
          "The weak shall fall before me!"
        ],
        playing: [
          "I wield the power of the gods!",
          "Your cards are no match for mine!",
          "I am unstoppable!",
          "The titan always prevails!"
        ],
        winning: [
          "As expected from a titan!",
          "I am the undisputed champion!",
          "None can stand against my might!",
          "The weak have no place in victory!"
        ],
        losing: [
          "Even titans can fall...",
          "This defeat will not be forgotten.",
          "I will return stronger than ever!",
          "The titan will rise again!"
        ]
      },
      strategies: {
        bidding: {
          style: "dominant",
          minBidThreshold: 0.4,
          maxBidAmount: 200,
          bluffFrequency: 0.3
        },
        playing: {
          style: "overwhelming",
          riskTolerance: 0.6,
          trumpUsage: "power",
          cardCounting: true,
          memory: "excellent"
        }
      },
      playingStyle: {
        aggression: 0.8,
        conservatism: 0.3,
        adaptability: 0.5,
        bluffing: 0.4,
        teamwork: 0.4
      }
    },
    
    "Sage": {
      name: "Sage",
      firstName: "Solomon",
      lastName: "Stargazer",
      fullName: "Solomon Stargazer",
      personality: "Wise and patient",
      description: "A player who values wisdom and patience. Believes in learning from every game and adapting strategies over time.",
      image: "🧙", // Wizard emoji
      quotes: {
        bidding: [
          "Wisdom guides my decisions.",
          "Patience is a virtue in bidding.",
          "I have learned from many games.",
          "The wise player knows when to wait."
        ],
        playing: [
          "Every move teaches a lesson.",
          "Wisdom comes from experience.",
          "I have seen this pattern before.",
          "The patient hunter gets the prey."
        ],
        winning: [
          "Wisdom prevails over haste.",
          "Experience is the best teacher.",
          "The sage knows the path to victory.",
          "Knowledge is the greatest weapon."
        ],
        losing: [
          "Even the wise can learn new lessons.",
          "Every defeat teaches wisdom.",
          "I will study this loss carefully.",
          "The sage grows stronger with each lesson."
        ]
      },
      strategies: {
        bidding: {
          style: "patient",
          minBidThreshold: 0.8,
          maxBidAmount: 150,
          bluffFrequency: 0.1
        },
        playing: {
          style: "methodical",
          riskTolerance: 0.2,
          trumpUsage: "careful",
          cardCounting: true,
          memory: "excellent"
        }
      },
      playingStyle: {
        aggression: 0.2,
        conservatism: 0.9,
        adaptability: 0.8,
        bluffing: 0.2,
        teamwork: 0.7
      }
    }
  }
};

// Helper functions for AI player management
function getRandomPlayer(slot) {
  const players = Object.keys(AI_PLAYERS[slot]);
  const randomIndex = Math.floor(Math.random() * players.length);
  return players[randomIndex];
}

function getPlayerData(slot, playerKey) {
  return AI_PLAYERS[slot][playerKey];
}

function getRandomQuote(slot, playerKey, context) {
  const player = getPlayerData(slot, playerKey);
  if (player && player.quotes && player.quotes[context]) {
    const quotes = player.quotes[context];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  return "I'm thinking...";
}

function getPlayerStrategy(slot, playerKey) {
  const player = getPlayerData(slot, playerKey);
  return player ? player.strategies : null;
}

function getPlayingStyle(slot, playerKey) {
  const player = getPlayerData(slot, playerKey);
  return player ? player.playingStyle : null;
}

// Function to select random AI players for a new game
function selectRandomAIPlayers() {
  const p1Player = getRandomPlayer('p1');
  const p2Player = getRandomPlayer('p2');
  const p3Player = getRandomPlayer('p3');
  
  return {
    p1: {
      key: p1Player,
      data: getPlayerData('p1', p1Player)
    },
    p2: {
      key: p2Player,
      data: getPlayerData('p2', p2Player)
    },
    p3: {
      key: p3Player,
      data: getPlayerData('p3', p3Player)
    }
  };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AI_PLAYERS,
    getRandomPlayer,
    getPlayerData,
    getRandomQuote,
    getPlayerStrategy,
    getPlayingStyle
  };
} 