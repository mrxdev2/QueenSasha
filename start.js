/**
 * Queen Sasha 👑 - Entry Point (Heroku Safe)
 * Boots web pairing UI + socket.io
 * Resumes saved WhatsApp sessions safely
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
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* =========================
   🔧 MIDDLEWARES
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Resources", "web")));

/* =========================
   🌐 ROUTES
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Resources", "web", "index.html"));
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    bot: settings.BOT_NAME,
    uptime: process.uptime()
  });
});

/* =========================
   💌 SOCKET.IO (PAIRING)
========================= */
registerSocketHandlers(io);

/* =========================
   🚀 SERVER START (HEROKU SAFE)
========================= */
const PORT = process.env.PORT || settings.PORT || 3000;

server.listen(PORT, () => {
  console.log(chalk.magentaBright(`\n👑 ${settings.BOT_NAME} is LIVE`));
  console.log(chalk.cyan(`🌐 Web pairing running on port ${PORT}`));
  console.log(chalk.green("💖 Open the web page to pair your WhatsApp number\n"));

  // Resume saved sessions AFTER server is ready
  setTimeout(() => {
    resumeExistingSessions(io);
  }, 2000);
});

/* =========================
   🛡️ SAFE ERROR HANDLING
========================= */
process.on("uncaughtException", (err) => {
  console.error(chalk.red("💔 Uncaught Exception"));
  console.error(err);
});

process.on("unhandledRejection", (reason) => {
  console.error(chalk.red("💔 Unhandled Rejection"));
  console.error(reason);
});
