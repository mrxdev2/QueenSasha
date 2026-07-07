# 👑 Queen Sasha — WhatsApp Bot

A stylish, multi-device WhatsApp bot built on [Baileys](https://github.com/WhiskeySockets/Baileys), with a
web page where users pair their own WhatsApp number using a **pairing code** — no QR scanning needed.

---

## ✨ Features

- 💌 Web-based pairing (enter your number, get a code, link it in WhatsApp → Linked Devices)
- 💾 Auto-saved sessions — survives restarts/redeploys
- 🎀 Simple plugin system (`Resources/plugins`) — drop in a `.js` file to add a command
- 💖 Built-in `.ping` and `.menu` commands
- 🌸 Feminine, pink-themed pairing page

---

## 🗂 Project Structure

```
QueenSasha/
├── index.js              # Core bot engine (Baileys connection, plugin loader)
├── start.js               # Entry point — web server + socket.io + auto-resume sessions
├── settings.js             # All configuration (env-var driven)
├── package.json
├── Procfile                 # For Heroku
├── app.json                  # For Heroku "Deploy" button
└── Resources/
    ├── Sessions/              # Auth sessions saved per phone number (auto-created)
    ├── plugins/                # Drop new commands here
    │   ├── ping.js
    │   └── menu.js
    ├── socket/
    │   └── socket.js            # Bridges web page <-> bot pairing logic
    └── web/
        ├── index.html            # Pairing page UI
        └── app.js                 # Pairing page client logic
```

---

## ⚙️ Configuration

All settings live in `settings.js` and can be overridden with environment variables:

| Variable        | Description                                   | Default              |
|-----------------|------------------------------------------------|----------------------|
| `BOT_NAME`      | Bot's display name                              | `Queen Sasha 👑`     |
| `OWNER_NUMBER`  | Your WhatsApp number, digits only, with country code | `255700000000` |
| `OWNER_NAME`    | Your display name                               | `Queen`              |
| `PREFIX`        | Command prefix                                  | `.`                  |
| `PUBLIC_MODE`   | `true`/`false` — allow everyone or owner only   | `true`                |
| `TIMEZONE`      | Timezone                                        | `Africa/Nairobi`      |
| `PORT`          | Web server port (set automatically by most hosts) | `3000`              |

---

## 💻 Run Locally

```bash
npm install
npm start
```

Then open **http://localhost:3000**, type your WhatsApp number (with country code, no `+`),
tap **Get Pairing Code**, then in WhatsApp go to:

`Settings → Linked Devices → Link a Device → Link with phone number instead`

and enter the code shown on the page.

---

## 🚀 Deploy to Heroku

1. Push this project to your own GitHub repository.
2. Create a new Heroku app (or use the `app.json` for a one-click deploy button).
3. Set the config vars (`OWNER_NUMBER` at minimum) under **Settings → Config Vars**.
4. Make sure the app has one **web** dyno running (`Procfile` already sets `web: node start.js`).
5. Deploy. Once it's live, open the Heroku app URL to reach the pairing page.

```bash
heroku create queen-sasha-bot
git push heroku main
heroku config:set OWNER_NUMBER=2557XXXXXXXX
heroku ps:scale web=1
```

⚠️ Heroku's free/eco dynos sleep and have an **ephemeral filesystem** — sessions saved in
`Resources/Sessions` can be wiped on dyno restarts unless you add a persistent add-on
(e.g. Heroku Postgres for session storage, or a volume-backed alternative). For always-on,
persistent hosting, consider a paid dyno or the bot-hosting.net option below.

---

## 🚀 Deploy to bot-hosting.net

1. Create an account and a new **Node.js** bot/server on bot-hosting.net.
2. Upload this whole `QueenSasha` folder (or connect your GitHub repo, if supported).
3. Set the **Start Command** to:
   ```
   npm start
   ```
4. Add the environment variables (`OWNER_NUMBER`, `BOT_NAME`, etc.) in their panel.
5. Start the server, then open the assigned URL/port to reach the pairing page and link your number.

---

## 🎀 Adding a New Plugin

Create a file in `Resources/plugins/`, e.g. `hello.js`:

```js
module.exports = {
  name: "Hello",
  command: ["hello"],
  description: "Say hi 💖",
  execute: async (sock, msg, args, ctx) => {
    await sock.sendMessage(ctx.from, { text: "Hii bestie! 💕" }, { quoted: msg });
  },
};
```

Restart the bot and `.hello` will work automatically.

---

💖 Powered by Queen Sasha 👑
