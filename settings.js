/**
 * Queen Sasha 👑 - Bot Configuration
 * Edit these values directly or set them as Environment Variables
 * on Heroku / bot-hosting.net for a cleaner setup.
 */

module.exports = {
  // 👑 Identity
  BOT_NAME: process.env.BOT_NAME || "Queen Sasha 👑",
  OWNER_NAME: process.env.OWNER_NAME || "Queen",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "255775710774", // no +, no spaces

  // 💅 Behaviour
  PREFIX: process.env.PREFIX || ".",
  PUBLIC_MODE: (process.env.PUBLIC_MODE || "true") === "true", // true = anyone can use, false = owner only
  AUTO_READ_STATUS: (process.env.AUTO_READ_STATUS || "true") === "true",
  AUTO_TYPING: (process.env.AUTO_TYPING || "false") === "true",
  WELCOME_MESSAGE: (process.env.WELCOME_MESSAGE || "true") === "true",

  // 🎀 Branding
  FOOTER: process.env.FOOTER || "💖 Powered by Queen Sasha 👑",

  // 🌸 Timezone
  TIMEZONE: process.env.TIMEZONE || "Africa/Nairobi",

  // 🔌 Server
  PORT: process.env.PORT || 3000,

  // 📁 Paths
  SESSION_DIR: "./Resources/Sessions",
  PLUGIN_DIR: "./Resources/plugins",
};
