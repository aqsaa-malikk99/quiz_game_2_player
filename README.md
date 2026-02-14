# 2 Player Quiz Game

A real-time two-player quiz over the same network. **Math**, **Science**, or **GK** categories with AI-generated questions (Gemini) or built-in fallback questions.

## How to play

1. **Open the same URL** on both devices (e.g. `http://192.168.0.18:3001`).
2. **Start or Join:**
   - **Player 1:** Click “Start a game”, enter your name, create a game. Share the **6-letter code** (e.g. `ABC123`) with your friend.
   - **Player 2:** Click “Join with code”, enter your name and the code your friend gave you.
3. **Lobby:** When both are in, either player clicks **Start game**.
4. **Categories:** Each player picks **Math**, **Science**, **GK**, or **Mixed** (same or different).
5. **Play:** Answer each question by tapping/clicking an option. After both answer, the next question appears.
6. **Results:** See scores with names, then **Play again** to go back to the lobby.

---

## Run (one URL for computer + phone)

The game is served from the **server** on **port 3001**. Use the same address on all devices.

### 1. Build the client (once)

```bash
cd client
npm install
npm run build
```

### 2. Start the server

```bash
cd server
npm install
npm run dev
```

Wait until you see: **Quiz server on http://0.0.0.0:3001**

### 3. Open the game

- **On this computer:** **http://localhost:3001**
- **On your phone (same Wi‑Fi):** **http://YOUR_IP:3001**

Example: if your IP is `192.168.0.18`, open **http://192.168.0.18:3001** on both devices.

---

## Find your IP (for opening on mobile)

- **Mac:** Terminal: `ipconfig getifaddr en0` (Wi‑Fi). Or **System Settings → Network → Wi‑Fi → Details**.
- **Windows:** **Command Prompt** → `ipconfig` → “IPv4 Address” under your Wi‑Fi adapter.
- **Linux:** `ip addr` or `hostname -I`

---

## Optional: Gemini AI questions

Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey), then:

```bash
export GEMINI_API_KEY=your_key_here
cd server && npm run dev
```

---

## Tech

- **Frontend:** React (Vite), Socket.io-client  
- **Backend:** Node, Express, Socket.io (serves the app + game logic)  
- **Questions:** Google Gemini API (optional) or built-in Math / Science / GK
