/**
 * Queen Sasha 👑 - Video download plugin
 */

const { resolveUrl, fetchDownloadLinks } = require("../lib/ytdl");

// Prefer a reasonable quality so files aren't huge on WhatsApp's upload limits.
const QUALITY_PREFERENCE = ["360", "480", "240", "144", "720", "1080"];

function pickQuality(videos) {
  if (!videos) return null;
  for (const q of QUALITY_PREFERENCE) {
    if (videos[q]) return videos[q];
  }
  const values = Object.values(videos);
  return values.length ? values[0] : null;
}

module.exports = {
  name: "Video",
  command: ["video", "mp4", "ytmp4"],
  description: "Download video kutoka YouTube — jina la wimbo au link 🎬",
  execute: async (sock, msg, args, ctx) => {
    const query = args.join(" ").trim();

    if (!query) {
      await sock.sendMessage(
        ctx.from,
        { text: `💅 Tumia: *${ctx.settings.PREFIX}video <jina au link ya YouTube>*` },
        { quoted: msg }
      );
      return;
    }

    try {
      await sock.sendMessage(ctx.from, { text: "🎬 Natafuta video, subiri kidogo..." }, { quoted: msg });

      const url = await resolveUrl(query);
      const data = await fetchDownloadLinks(url);

      const videoUrl = pickQuality(data.videos);
      if (!videoUrl) throw new Error("Video haipatikani kwa link hii.");

      await sock.sendMessage(
        ctx.from,
        {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          caption: `🎬 *${data.title || "Video"}*\n\n${ctx.settings.FOOTER}`,
        },
        { quoted: msg }
      );
    } catch (err) {
      await sock.sendMessage(ctx.from, { text: `💔 Samahani, imeshindikana: ${err.message}` }, { quoted: msg });
    }
  },
};
