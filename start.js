/**
 * Queen Sasha 👑 - Entry Point
 * Boots the web server (pairing UI) + socket.io, then resumes any saved
 * WhatsApp sessions and listens for new pairing requests from the browser.
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const chalk = require("chalk");

const settings = require("./settings");
const { resumeExistingSessions } = require("./index");
const registerSocketHandlers = require("./Resources/socket/socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "Resources", "web")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Resources", "web", "index.html"));
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", bot: settings.BOT_NAME });
});

// 💌 Wire up the socket.io pairing logic (browser <-> bot)
registerSocketHandlers(io);

server.listen(settings.PORT, () => {
  console.log(chalk.magentaBright(`\n👑 ${settings.BOT_NAME} is starting up...`));
  console.log(chalk.cyan(`🌐 Web pairing page running on port ${settings.PORT}`));
  console.log(chalk.green("💖 Open the web page to pair your WhatsApp number.\n"));

  // ✨ Bring back any sessions that were already linked before a restart/redeploy
  resumeExistingSessions(io);
});

process.on("uncaughtException", (err) => {
  console.log(chalk.red(`💔 Uncaught Exception: ${err.message}`));
});

process.on("unhandledRejection", (err) => {
  console.log(chalk.red(`💔 Unhandled Rejection: ${err?.message || err}`));
});
