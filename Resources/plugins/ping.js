/**
 * Queen Sasha 👑 - Ping Plugin
 */

module.exports = {
  name: "Ping",
  command: ["ping", "p"],
  description: "Check if Queen Sasha is online 💖",
  execute: async (sock, msg, args, ctx) => {
    const start = Date.now();
    const sent = await sock.sendMessage(ctx.from, { text: "💫 Pinging..." }, { quoted: msg });
    const latency = Date.now() - start;

    await sock.sendMessage(
      ctx.from,
      {
        text: `👑 *${ctx.settings.BOT_NAME}* is online!\n💓 Speed: ${latency}ms\n\n${ctx.settings.FOOTER}`,
        edit: sent.key,
      },
      { quoted: msg }
    );
  },
};
