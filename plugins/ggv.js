const config = require("../config");
const { cmd } = require("../command");
const axios = require("axios");
const { getBuffer } = require("../lib/functions");

cmd({
  pattern: "video",
  alias: ["ytmp4", "mp4"],
  desc: "Download YouTube video",
  category: "Downloaders",
  use: "<song name or YouTube link>",
  filename: __filename,
  react: "📹"
}, async (m, query, conn) => {
  if (!query) return m.reply("Please provide a song name or YouTube link!");

  const thumb = "https://files.catbox.moe/fgiecg.jpg";

  const fakeQuoted = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: "YouTube Downloader",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;YouTube Downloader;;;\nFN:YouTube Downloader\nORG:Powered by Pkdriller\nTEL;type=CELL;type=VOICE;waid=254700000000:+254700000000\nEND:VCARD`}}
  };

  const context = {
    contextInfo: {
      externalAdReply: {
        title: "PK-XMD YT VIDEO DOWNLOADER",
        body: "Powered by Pkdriller",
        thumbnail: await getBuffer(thumb),
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: true,
        sourceUrl: "https://youtube.com"
      },
      forwardingScore: 9999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363027322595636@newsletter",
        newsletterName: config.botname,
        serverMessageId: 100
      }
    },
    quoted: fakeQuoted
  };

  let apis = [
    `https://api.siputzx.my.id/api/download/youtube?query=${encodeURIComponent(query)}`,
    `https://dreaded.site/api/ytmp4?query=${encodeURIComponent(query)}`,
    `https://apis.davidcyriltech.my.id/youtube/mp4?query=${encodeURIComponent(query)}`
  ];

  let success = false;
  for (let url of apis) {
    try {
      let { data } = await axios.get(url);
      let dl_url = data?.url || data?.result?.url || data?.result?.downloadUrl;
      let title = data?.title || data?.result?.title || "Downloaded Video";

      if (!dl_url) continue;

      await conn.sendMessage(m.chat, {
        video: { url: dl_url },
        caption: `📹 *Title:* ${title}\n✅ Successfully downloaded by *PK-XMD*`,
        mimetype: "video/mp4"
      }, context);

      success = true;
      break;
    } catch (e) {
      continue;
    }
  }

  if (!success) {
    await m.reply("❌ Failed to fetch video. Please try another keyword or check the link.");
  }
});
    
