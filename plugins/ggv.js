const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "video",
  alias: ["ytmp4", "mp4", "ytvideo", "dlmp4"],
  desc: "Download YouTube Video",
  category: "main",
  filename: __filename,
  react: "🎥"
}, async (conn, m, msg, { q, from, sender, reply }) => {
  if (!q) return reply("Please provide a video name or YouTube URL.");

  const apis = [
    `https://api-dl-01.vercel.app/youtube/playmp4?q=${encodeURIComponent(q)}`,
    `https://apis-davidcyriltech.my.id/youtube/playmp4?q=${encodeURIComponent(q)}`,
    `https://yt-api.onrender.com/api/playmp4?q=${encodeURIComponent(q)}`
  ];

  let result = null;
  for (let api of apis) {
    try {
      const res = await axios.get(api);
      if (res.data?.result?.url) {
        result = res.data.result;
        break;
      }
    } catch (e) {
      console.log(`[Video API Error]`, e.message);
    }
  }

  if (!result) return reply("❌ Failed to fetch video. Please try another link or keyword.");

  const fakeVCard = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: "WhatsApp",
        vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp Verified\nORG:WhatsApp Inc.\nTEL;type=CELL;type=VOICE;waid=447710173736:+44 7710 173736\nEND:VCARD"
      }
    }
  };

  const contextInfo = {
    quoted: fakeVCard,
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363313124070136@newsletter",
      newsletterName: "PK-XMD Videos",
      serverMessageId: Math.floor(100000 + Math.random() * 999999)
    },
    externalAdReply: {
      title: result.title.length > 25 ? result.title.slice(0, 22) + "..." : result.title,
      body: "Now Playing via PK-XMD",
      thumbnailUrl: "https://files.catbox.moe/fgiecg.jpg",
      mediaType: 1,
      renderLargerThumbnail: true,
      sourceUrl: result.source || result.url,
      showAdAttribution: true
    }
  };

  await conn.sendMessage(from, {
    video: { url: result.url },
    caption: `🎥 *${result.title}*\n⏱️ Duration: ${result.duration || "N/A"}\n🎬 Channel: ${result.channel || "Unknown"}`,
    mimetype: "video/mp4",
    contextInfo
  }, { quoted: m });

  await conn.sendMessage(from, {
    document: { url: result.url },
    mimetype: "video/mp4",
    fileName: `${result.title.replace(/[^\w\s.-]/gi, '')}.mp4`,
    caption: `📄 *${result.title}* (as document)`,
    contextInfo
  }, { quoted: m });
});
