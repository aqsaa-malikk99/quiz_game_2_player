# 🎯 2 Player Quiz Game

A real-time multiplayer quiz game for two players over the same network. Pick **Math**, **Science**, or **General Knowledge** categories, compete head-to-head with AI-generated or built-in questions, and see who knows more.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Node](https://img.shields.io/badge/Node-18+-339933?logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?logo=socket.io)

---

## ✨ Features

- **Start or Join by code** — One player creates a game, the other joins with a 6-letter code
- **Custom names** — Both players choose their display name
- **Categories** — Math, Science, GK, or Mixed (same or different per player)
- **10 questions per round** — Random order each game
- **20-second timer** — Per question; time’s up if no answer
- **Live feedback** — See who answered and who got it right
- **AI questions** — Optional Google Gemini API for fresh questions, or built-in fallback
- **Works on same Wi‑Fi** — Use one URL on computer and phone

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org)
- Same Wi‑Fi for both players

### Installation

```bash
# Clone the repo
git clone https://github.com/aqsaa-malikk99/quiz_game_2_player.git
cd quiz_game_2_player

# Install dependencies
npm run install:all

# Build the client (once)
cd client && npm run build && cd ..
```

### Run the server

```bash
cd server
npm run dev
```

When you see **Quiz server on http://0.0.0.0:3001**, open:

- **Same machine:** http://localhost:3001  
- **Phone on same Wi‑Fi:** http://YOUR_IP:3001  

Find your IP:
- **Mac:** `ipconfig getifaddr en0`
- **Windows:** `ipconfig` (look for IPv4)
- **Linux:** `hostname -I`

---

## 🎮 How to Play

| Step | Action |
|------|--------|
| 1 | Both players open the same URL (e.g. `http://192.168.0.18:3001`) |
| 2 | **Player 1:** Start a game → enter name → share the **6-letter code** (e.g. `ABC123`) |
| 3 | **Player 2:** Join with code → enter name and code |
| 4 | Both click **Start game** when ready |
| 5 | Each player picks a category: Math, Science, GK, or Mixed |
| 6 | Answer 10 questions — 20 seconds each; both must answer or time runs out |
| 7 | See who got each question right, then move to the next |
| 8 | View final scores and tap **Play again** for another round |

---

## 🤖 Optional: AI-Generated Questions (Gemini)

The game can use the **Google Gemini API** for new questions each round.

1. Get a free API key: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Copy the key and create a `.env` file in the `server` folder:

```bash
cd server
cp .env.example .env
```

3. Add your key to `server/.env`:

```
GEMINI_API_KEY=your_api_key_here
```

4. Restart the server. You should see: `[Quiz] Gemini API enabled — using AI-generated questions`

**Without a Gemini API key**, the game uses built-in questions (10 per category).

---

## 📁 Project Structure

```
quiz_game_2_player/
├── client/                 # React (Vite) frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Game.jsx        # Question UI, timer, answers
│   │   ├── Lobby.jsx       # Start/Join, player list
│   │   ├── CategorySelect.jsx
│   │   ├── Results.jsx
│   │   └── useSocket.js    # Socket.io hooks
│   └── vite.config.js
├── server/                 # Node + Express + Socket.io
│   ├── index.js            # Game logic, rooms, events
│   ├── questions.js        # Gemini + fallback questions
│   ├── public/             # Built client (from npm run build)
│   └── .env                # GEMINI_API_KEY (create from .env.example)
├── package.json
└── README.md
```

---

## 🛠 Tech Stack

| Layer   | Tech |
|---------|------|
| Frontend | React 18, Vite, Socket.io-client |
| Backend  | Node.js, Express, Socket.io |
| Questions | Google Gemini API (optional) or built-in JSON |

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Cannot GET /"** | Open port **3001** (e.g. `http://192.168.0.18:3001`), not 3000 |
| **"Can't connect to server"** | Start the server first (`cd server && npm run dev`), then open the app |
| **Questions not loading** | Run `cd client && npm run build` so `server/public` is updated |
| **Phone can't join** | Ensure both devices are on the same Wi‑Fi and use your computer’s IP |
| **Gemini 404** | The server tries several models; if all fail, built-in questions are used |

---

## 📄 License

MIT
