/**
 * Queen Sasha 👑 - YouTube download helper
 * Wraps https://yt-dl.officialhectormanuel.workers.dev/ and adds text-search support.
 */

const axios = require("axios");
const yts = require("yt-search");

const API_BASE = "https://yt-dl.officialhectormanuel.workers.dev/";

/**
 * Resolves a user query to a YouTube URL.
 * If it's already a URL, returns it as-is. Otherwise searches YouTube and
 * returns the first result's URL.
 */
async function resolveUrl(query) {
  if (/^https?:\/\//i.test(query)) return query;

  const result = await yts(query);
  const first = result?.videos?.[0];
  if (!first) throw new Error("Video haikupatikana kwa jina hilo.");
  return first.url;
}

/**
 * Fetches download links (audio + video qualities) for a YouTube URL.
 */
async function fetchDownloadLinks(youtubeUrl) {
  const { data } = await axios.get(API_BASE, {
    params: { url: youtubeUrl },
    timeout: 30000,
  });

  if (!data || data.status !== true) {
    throw new Error("API haikuweza kupata taarifa za video hii.");
  }

  return data;
}

module.exports = { resolveUrl, fetchDownloadLinks };
