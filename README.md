# Call Bridge – Premium Mobile Card Game

A modern, mobile-first web application for the traditional South Asian / Bangladeshi card game **Call Bridge**. Features intelligent solo AI opponents, live real-time multiplayer private rooms with Socket.IO, an authentic scoring engine, and a casino-grade dark emerald felt aesthetic.

---

## 🎴 Authentic Bangladeshi Call Bridge Rules

1. **Deck & Seating**: Standard 52-card deck dealt evenly to 4 players (13 cards each).
2. **Permanent Trump**: ♠️ **Spades are always the trump suit**.
3. **Bidding (Calling)**: Before playing, each player bids between 1 and 13 tricks based on hand strength.
4. **Mandatory Following & Trumping**:
   - Players **must follow suit** if they have cards of the led suit.
   - **Crucial Rule**: If unable to follow suit (void), players **must play a Trump card (♠ Spade)** if they have one.
   - Only when void in both the led suit and Spades can a player discard any other card.
5. **Trick Winner**: Highest Spade wins the trick. If no Spades were played, the highest card of the led suit wins. Trick winner leads the next trick.
6. **Configurable Scoring Engine**:
   - **Exact Bid**: Reaching the exact bid awards that number of points (e.g. Bid `3`, Won `3` ➔ `3.0`).
   - **Overtricks**: Extra tricks beyond the bid award `+0.1` per trick (e.g. Bid `3`, Won `4` ➔ `3.1`; Bid `4`, Won `6` ➔ `4.2`).
   - **Failed Bid**: Falling short results in a negative penalty equal to the bid (e.g. Bid `3`, Won `2` ➔ `-3.0`).
7. **Match Conclusion**: Games run for 3 to 10 sets/rounds; highest cumulative total score takes 1st place 🥇.

---

## 🚀 Key Features

- **📱 Mobile-First 9:16 Design**: Crafted specifically for Android and iOS touchscreens with horizontal card layout matching authentic card games, safe-area inset support, and zero horizontal scrolling.
- **🤖 Built-in Game Bot Engine**: 100% offline rule-based heuristics (hand strength calculation, suit-void awareness, mandatory trump ruffing, economical trick winning) with 3 difficulty settings (*Easy*, *Medium*, *Hard*) and zero external AI APIs.
- **🌐 Real-Time Multiplayer Rooms**: Host private matches with 4-letter room codes, live Socket.IO state synchronization, ready/unready system, and one-click computer bot fills.
- **📊 Floating Score Table Popup**: Accessible at any point during gameplay with full round-by-round breakdown, calls, tricks won, and dynamic medal podium standings.
- **💬 Table Chat & Quick Reactions**: In-game reaction emojis (👍, 🔥, 👏, ♠️) and quick tactical phrases ("Trumped!", "Good trick!", "Nice bid!").
- **🎵 Procedural Web Audio Synth**: Casino-grade tactile feedback (card slide, felt snap, trump chord, trick collection whoosh, fanfare) without heavy audio files.
- **📈 Career Statistics**: Tracks total matches, win rate %, tricks won, and highest round score stored locally.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, Socket.IO.
- **Build Tool**: Vite with tsx hot development.
- **Directory Structure**:
  - `src/types/game.ts`: Domain models and types.
  - `src/engine/deck.ts`: 52-card deck generation, Fisher-Yates shuffle, and suit sorting.
  - `src/engine/rules.ts`: Bangladeshi Call Bridge rules, move validation, and trick evaluation.
  - `src/engine/scoring.ts`: Configurable scoring calculator and ranking logic.
  - `src/engine/ai.ts`: Bid estimation and strategic card selection heuristics.
  - `src/engine/sound.ts`: Low-latency procedural Web Audio synthesizer.
  - `src/engine/storage.ts`: Local player profile and statistics persistence.
  - `src/components/`: Modular UI (GameTable, PlayingCard, PlayerSeat, BiddingModal, ScoreModal, RoundEndModal, MatchEndModal, Lobby, ChatDrawer, RulesModal, SettingsModal).
  - `server.ts`: Express + Socket.IO server running WebSocket rooms and serving the app.

---

## 💻 Development & Deployment Commands

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
# Starts full-stack server on port 3000 (Express + Socket.IO + Vite middleware)
```

### Production Build
```bash
npm run build
npm start
# Serves optimized static assets and Socket.IO on port 3000
```

### Environment Variables
Refer to `.env.example`:
```ini
APP_URL="http://localhost:3000"
```
No external database credentials or third-party API keys are required for core gameplay. Real-time multiplayer rooms run authoritatively on the integrated Node.js Socket.IO server.
