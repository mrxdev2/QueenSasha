/**
 * Queen Sasha 👑 - Song (audio) download plugin
 */

const { resolveUrl, fetchDownloadLinks } = require("../lib/ytdl");

module.exports = {
  name: "Song",
  command: ["song", "play", "audio"],
  description: "Download audio kutoka YouTube — jina la wimbo au link 🎵",
  execute: async (sock, msg, args, ctx) => {
    const query = args.join(" ").trim();

    if (!query) {
      await sock.sendMessage(
        ctx.from,
        { text: `💅 Tumia: *${ctx.settings.PREFIX}song <jina la wimbo au link ya YouTube>*` },
        { quoted: msg }
      );
      return;
    }

    try {
      await sock.sendMessage(ctx.from, { text: "🎧 Natafuta wimbo, subiri kidogo..." }, { quoted: msg });

      const url = await resolveUrl(query);
      const data = await fetchDownloadLinks(url);

      if (!data.audio) throw new Error("Audio haipatikani kwa video hii.");

      await sock.sendMessage(
        ctx.from,
        {
          audio: { url: data.audio },
          mimetype: "audio/mpeg",
          fileName: `${(data.title || "audio").slice(0, 60)}.mp3`,
        },
        { quoted: msg }
      );
    } catch (err) {
      await sock.sendMessage(ctx.from, { text: `💔 Samahani, imeshindikana: ${err.message}` }, { quoted: msg });
    }
  },
};
