/**
 * Queen Sasha 👑 - Pair Plugin
 * Generates a WhatsApp pairing code for a phone number, same flow as the web pairing page.
 * NOTE: the code only works if it's entered manually on the *target* number's own
 * WhatsApp > Linked Devices menu — it cannot link a number without that number's
 * own action, so this cannot be used to hijack someone else's account silently.
 */

const { startBot, activeSockets } = require("../../index");

module.exports = {
  name: "Pair",
  command: ["pair"],
  description: "Pata pairing code ya kuunganisha namba na bot 🔗",
  execute: async (sock, msg, args, ctx) => {
    const number = String(args[0] || "").replace(/[^0-9]/g, "");

    if (!number || number.length < 9) {
      await sock.sendMessage(
        ctx.from,
        { text: `💅 Tumia: *${ctx.settings.PREFIX}pair 2557XXXXXXXX*\n(namba yenye country code, bila + wala nafasi)` },
        { quoted: msg }
      );
      return;
    }

    if (activeSockets[number]) {
      await sock.sendMessage(ctx.from, { text: "👑 Namba hii tayari imeunganishwa na bot." }, { quoted: msg });
      return;
    }

    await sock.sendMessage(ctx.from, { text: `✨ Naandaa pairing code ya *${number}*, subiri kidogo...` }, { quoted: msg });

    try {
      await startBot(number, null, async (code) => {
        await sock.sendMessage(
          ctx.from,
          {
            text:
              `👑 *Pairing Code*: \`${code}\`\n\n` +
              `📱 Fungua WhatsApp kwenye namba *${number}* → Mipangilio → Vifaa Vilivyounganishwa → Unganisha Kifaa → weka code hii.\n\n` +
              `${ctx.settings.FOOTER}`,
          },
          { quoted: msg }
        );
      });
    } catch (err) {
      await sock.sendMessage(ctx.from, { text: `💔 Imeshindikana kutengeneza pairing code: ${err.message}` }, { quoted: msg });
    }
  },
};
