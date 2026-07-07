/**
 * Queen Sasha 👑 - Core Bot Engine
 * Built on @whiskeysockets/baileys (multi-device WhatsApp Web API)
 * Handles: connection, pairing code, auto-reconnect, message routing, plugins.
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  Browsers,
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const settings = require("./settings");

// Keep track of active socket connections, keyed by session id (phone number)
const activeSockets = {};
let cachedPlugins = null;

/**
 * 🎀 Loads every plugin found in Resources/plugins.
 * Each plugin file must export: { name, command: [aliases], description, execute(sock, msg, args, ctx) }
 */
function loadPlugins() {
  const pluginDir = path.join(__dirname, "Resources", "plugins");
  fs.ensureDirSync(pluginDir);

  const plugins = [];
  const files = fs.readdirSync(pluginDir).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    try {
      delete require.cache[require.resolve(path.join(pluginDir, file))];
      const plugin = require(path.join(pluginDir, file));
      if (plugin && plugin.command) {
        plugins.push(plugin);
      }
    } catch (err) {
      console.log(chalk.red(`💔 Failed to load plugin "${file}": ${err.message}`));
    }
  }

  console.log(chalk.magenta(`💅 Loaded ${plugins.length} plugin(s) successfully!`));
  return plugins;
}

function getPlugins(forceReload = false) {
  if (!cachedPlugins || forceReload) {
    cachedPlugins = loadPlugins();
  }
  return cachedPlugins;
}

/**
 * 👑 Starts (or resumes) a WhatsApp session for the given phone number.
 * @param {string} number  Phone number (digits only, no "+") used as session id.
 * @param {object} io      socket.io server instance, used to relay pairing codes / status to the web UI.
 * @param {function} onPairingCode  Optional callback fired with the pairing code once generated.
 */
async function startBot(number, io, onPairingCode) {
  const sessionId = number.replace(/[^0-9]/g, "");
  const sessionPath = path.join(__dirname, settings.SESSION_DIR, sessionId);
  fs.ensureDirSync(sessionPath);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const logger = pino({ level: "silent" });

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: Browsers.macOS("Safari"),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    generateHighQualityLinkPreview: true,
  });

  activeSockets[sessionId] = sock;

  // 💕 Request a pairing code if this session isn't registered yet
  if (!sock.authState?.creds?.registered) {
    try {
      await new Promise((r) => setTimeout(r, 1500)); // small delay helps stability
      const code = await sock.requestPairingCode(sessionId);
      console.log(chalk.magenta(`👑 Pairing code for ${sessionId}: ${code}`));
      if (typeof onPairingCode === "function") onPairingCode(code);
      if (io) io.emit("pairing-code", { number: sessionId, code });
    } catch (err) {
      console.log(chalk.red(`💔 Could not generate pairing code: ${err.message}`));
      if (io) io.emit("pairing-error", { number: sessionId, error: err.message });
    }
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log(chalk.green(`💖 ${settings.BOT_NAME} is now connected! (session: ${sessionId})`));
      if (io) io.emit("connected", { number: sessionId });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(chalk.yellow(`🎀 Connection closed (session: ${sessionId}). Reconnecting: ${shouldReconnect}`));
      if (io) io.emit("disconnected", { number: sessionId, willReconnect: shouldReconnect });

      if (shouldReconnect) {
        setTimeout(() => startBot(sessionId, io), 3000);
      } else {
        await fs.remove(sessionPath);
        delete activeSockets[sessionId];
        console.log(chalk.red(`👋 Session ${sessionId} logged out. Please pair again.`));
      }
    }
  });

  // 🌸 Message handling
  sock.ev.on("messages.upsert", async (m) => {
    try {
      const msg = m.messages?.[0];
      if (!msg || !msg.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;
      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        "";

      if (!body.startsWith(settings.PREFIX)) return;

      const args = body.slice(settings.PREFIX.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase();

      const plugins = getPlugins();
      const plugin = plugins.find((p) => p.command.includes(commandName));

      if (plugin) {
        if (settings.AUTO_TYPING) await sock.sendPresenceUpdate("composing", from);
        await plugin.execute(sock, msg, args, { from, settings, commandName });
      }
    } catch (err) {
      console.log(chalk.red(`💔 Error handling message: ${err.message}`));
    }
  });

  return sock;
}

/**
 * ✨ Auto-resume any sessions that already exist on disk (e.g. after a restart/deploy).
 */
async function resumeExistingSessions(io) {
  const sessionsRoot = path.join(__dirname, settings.SESSION_DIR);
  fs.ensureDirSync(sessionsRoot);

  const existing = fs
    .readdirSync(sessionsRoot)
    .filter((name) => fs.statSync(path.join(sessionsRoot, name)).isDirectory());

  for (const sessionId of existing) {
    console.log(chalk.cyan(`💫 Resuming saved session: ${sessionId}`));
    startBot(sessionId, io).catch((err) =>
      console.log(chalk.red(`💔 Failed to resume session ${sessionId}: ${err.message}`))
    );
  }
}

module.exports = { startBot, resumeExistingSessions, activeSockets, getPlugins };
