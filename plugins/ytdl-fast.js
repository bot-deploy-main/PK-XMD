const { cmd } = require('../command');
const config = require('../config');
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone');

cmd({
  pattern: "play",
  alias: ["song", "music"],
  desc: "Download audio by song name",
  category: "Downloaders",
  use: "<song name>",
  filename: __filename,
  react: "🎵",
  fromMe: false
}, async (m, text, conn) => {
  if (!text) return m.reply("🎧 *Enter a song name to search!*");

  const loading = await m.reply("🔎 Searching...");

  // Try 1 - YouTube (apis-keith)
  let res, title, audioUrl, thumb;
  try {
    const yt = await axios.get(`https://apis-keith.vercel.app/api/yts?query=${encodeURIComponent(text)}`);
    const first = yt.data.data[0];
    if (!first) throw "Not found on YT";
    title = first.title;
    thumb = first.thumbnail;
    const dl = await axios.get(`https://apis-keith.vercel.app/api/ytdl?url=${first.url}`);
    audioUrl = dl.data.result.audio;
    res = { audioUrl, title, thumb };
  } catch (e1) {
    // Try 2 - SoundCloud
    try {
      const sc = await axios.get(`https://api.siputzx.my.id/api/search/soundcloud?q=${encodeURIComponent(text)}`);
      const link = sc.data.result[0]?.url;
      const scdl = await axios.get(`https://api.siputzx.my.id/api/download/soundcloud?url=${link}`);
      title = scdl.data.result.title;
      audioUrl = scdl.data.result.download;
      thumb = scdl.data.result.thumbnail;
      res = { audioUrl, title, thumb };
    } catch (e2) {
      // Try 3 - Spotify
      try {
        const sp = await axios.get(`https://api.siputzx.my.id/api/search/spotify?q=${encodeURIComponent(text)}`);
        const spot = sp.data.result[0];
        title = spot.title;
        audioUrl = spot.audio;
        thumb = spot.thumbnail;
        res = { audioUrl, title, thumb };
      } catch (e3) {
        return m.reply("❌ Failed to fetch audio from all sources.");
      }
    }
  }

  const { title: songTitle, audioUrl: audio, thumb: thumbnail } = res;

  const fakeContact = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: "WhatsApp",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;WhatsApp;;;FN:WhatsApp\nORG:Meta\nTITLE:Verified Contact\nitem1.TEL;waid=254700000000:+254 700 000000\nitem1.X-ABLabel:Verified Business\nEND:VCARD`
      }
    }
  };

  const now = moment().tz("Africa/Nairobi");
  const time = now.format("HH:mm:ss");
  const date = now.format("DD/MM/YYYY");

  await conn.sendFile(m.chat, audio, `${songTitle}.mp3`, `🎧 *Title:* ${songTitle}\n🕒 *Time:* ${time}\n📅 *Date:* ${date}\n\n_Powered by Pkdriller_`, m, {
    quoted: fakeContact,
    contextInfo: {
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363190670123456@newsletter",
        serverMessageId: 100,
        newsletterName: "PK-XMD Official"
      },
      externalAdReply: {
        title: `🎶 ${songTitle}`,
        body: "Powered by Pkdriller • PK-XMD",
        thumbnailUrl: "https://files.catbox.moe/glt48n.jpg",
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
        sourceUrl: "https://github.com/nexustech1911/PK-XMD"
      }
    }
  });

  await loading.delete?.();
});
        
