# ubiquitous-octo-doodle
A browser-based implementation of the classic Rook card game, featuring AI opponents and a complete game interface.

## 🎮 Rook Card Game

Rook is a classic trick-taking card game that uses a special deck with 56 cards (4 suits with values 1-14) plus a special Rook card. This implementation features:

### Game Features
- **4 Players**: 1 human player + 3 AI opponents
- **Special Deck**: Red ♥, Green ♠, Black ♣, Yellow ♦ suits with values 1-14
- **Rook Card**: Special card with value 0
- **Team Play**: You + P2 vs P1 + P3
- **13 Hands**: Complete game with 13 rounds
- **Point Cards**: 14, 10, and 5 are worth 10 points each

### How to Play
1. **Dealing**: Cards are dealt in rotation with a 5-card "kitty"
2. **Tricks**: Players take turns playing cards to win tricks
3. **Scoring**: Collect point cards (14, 10, 5) to score points
4. **Winning**: Higher card values win tricks (14 is highest, Rook is 0)
5. **Objective**: Score the most points as a team

### Game Interface
- **Your Hand**: Click cards to play them
- **AI Players**: Hand sizes shown as card stacks
- **Play Area**: Shows the kitty and currently played cards
- **Statistics**: Real-time scoring and game progress
- **Trick Collection**: See which cards each player has won

### Controls
- Click any card in your hand to play it
- AI players automatically make their moves
- Use "New Game" button to start a fresh game

### Running the Game
```bash
python3 -m http.server 2000
```
Then open your browser to `http://localhost:2000`

### Game Rules Summary
- **Card Values**: 1-14 (14 is highest)
- **Point Cards**: 14, 10, 5 = 10 points each
- **Suits**: Red ♥, Green ♠, Black ♣, Yellow ♦
- **Special**: Rook card 🃏 (value 0)
- **Scoring**: Collect point cards to score
- **Winning**: Higher card value wins the round

The game features a clean, retro-inspired interface with smooth gameplay and intelligent AI opponents. Perfect for learning Rook or enjoying a quick game!