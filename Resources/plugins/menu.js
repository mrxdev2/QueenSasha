/**
 * Queen Sasha 👑 - Menu Plugin
 */

const { getPlugins } = require("../../index");

module.exports = {
  name: "Menu",
  command: ["menu", "help", "list"],
  description: "Show all available commands 🎀",
  execute: async (sock, msg, args, ctx) => {
    const plugins = getPlugins();

    let text = `╭───「 *${ctx.settings.BOT_NAME}* 」\n`;
    text += `│ 💅 Prefix: *${ctx.settings.PREFIX}*\n`;
    text += `│ 🎀 Total commands: ${plugins.length}\n`;
    text += `╰─────────────\n\n`;

    for (const plugin of plugins) {
      text += `✨ *${ctx.settings.PREFIX}${plugin.command[0]}* — ${plugin.description || "No description"}\n`;
    }

    text += `\n${ctx.settings.FOOTER}`;

    await sock.sendMessage(ctx.from, { text }, { quoted: msg });
  },
};
