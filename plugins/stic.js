const config = require("../config");
const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "playx",
  alias: ["ytmp3docx", "audiodocx", "ytax"],
  category: "main",
  react: "🎶",
  desc: "Download YouTube audio",
  use: ".play3 <query>",
  filename: __filename
}, async (conn, mek, m, { from, prefix, q, reply }) => {
  try {
    if (!q) return reply("Please provide a song name or YouTube URL.");

    const search = await axios.get(`https://yts.giftedtech.co.ke/?q=${encodeURIComponent(q)}`);
    const result = search.data;

    if (!result?.videos?.length) return reply("❌ No results found.");

    const first = result.videos[0];
    const videoUrl = first.url;

    const fallbackApis = [
      `${config.GiftedTechApi}/api/download/ytmp3?apikey=${config.GiftedApiKey}&url=${encodeURIComponent(videoUrl)}`,
      `${config.GiftedTechApi}/api/download/yta?apikey=${config.GiftedApiKey}&url=${encodeURIComponent(videoUrl)}`,
      `${config.GiftedTechApi}/api/download/dlmp3?apikey=${config.GiftedApiKey}&url=${encodeURIComponent(videoUrl)}`,
      `${config.GiftedTechApi}/api/download/mp3?apikey=${config.GiftedApiKey}&url=${encodeURIComponent(videoUrl)}`,
      `${config.GiftedTechApi}/api/download/ytaudio?apikey=${config.GiftedApiKey}&url=${encodeURIComponent(videoUrl)}`,
      `${config.GiftedTechApi}/api/download/ytmusic?apikey=${config.GiftedApiKey}&url=${encodeURIComponent(videoUrl)}`
    ];

    let downloadUrl = null;

    for (const api of fallbackApis) {
      try {
        const res = await axios.get(api);
        if (res.data?.result?.download_url) {
          downloadUrl = res.data.result.download_url;
          break;
        }
      } catch (err) {
        console.log("API failed:", api);
      }
    }

    if (!downloadUrl) return reply("❌ Failed to fetch audio. Try a different keyword.");

    await conn.sendMessage(from, {
      audio: { url: downloadUrl },
      mimetype: "audio/mpeg",
      fileName: `${first.name}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: first.name.length > 25 ? first.name.slice(0, 22) + "..." : first.name,
          body: "Powered by PK-XMD",
          mediaType: 1,
          thumbnailUrl: first.thumbnail || "https://files.catbox.moe/fgiecg.jpg",
          sourceUrl: "https://whatsapp.com/channel/0029Vad7YNyJuyA77CtIPX0x",
          mediaUrl: "https://whatsapp.com/channel/0029Vad7YNyJuyA77CtIPX0x",
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: mek });

  } catch (error) {
    console.error(error);
    reply("❌ An error occurred. Try again later.");
  }
});
    
