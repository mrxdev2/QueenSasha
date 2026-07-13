/**
 * Queen Sasha 👑 - Pairlist Plugin
 * Shows every number currently connected/paired with the bot.
 */

const { activeSockets } = require("../../index");

function maskNumber(number) {
  if (number.length <= 6) return number;
  const start = number.slice(0, 4);
  const end = number.slice(-3);
  return `${start}${"*".repeat(Math.max(number.length - 7, 3))}${end}`;
}

module.exports = {
  name: "Pairlist",
  command: ["pairlist", "connected"],
  description: "Onesha namba zote zilizounganishwa na bot 📋",
  execute: async (sock, msg, args, ctx) => {
    const numbers = Object.keys(activeSockets);

    if (numbers.length === 0) {
      await sock.sendMessage(ctx.from, { text: "📭 Hakuna namba yoyote iliyounganishwa kwa sasa." }, { quoted: msg });
      return;
    }

    let text = `╭───「 📋 *Paired Numbers* 」\n`;
    text += `│ Jumla: ${numbers.length}\n`;
    text += `╰─────────────\n\n`;
    numbers.forEach((num, i) => {
      text += `${i + 1}. ${maskNumber(num)}\n`;
    });
    text += `\n${ctx.settings.FOOTER}`;

    await sock.sendMessage(ctx.from, { text }, { quoted: msg });
  },
};
