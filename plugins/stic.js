const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');
const moment = require('moment-timezone');

cmd({
  pattern: "playx",
  alias: ["ytmusic", "ytax", "ytaudio", "ytmp3x"],
  desc: "Download audio from YouTube with multiple fallback APIs",
  category: "downloader",
  filename: __filename,
  react: "🎶"
}, async (conn, m, text) => {
  const { prefix, botName, menuImage } = config;
  if (!text) return m.reply(`🎶 *Usage:* ${prefix}playx <song name>`);

  await m.react("⏳");

  let search, title, url;
  try {
    const res = await axios.get(`https://api.davidcyriltech.my.id/api/youtube/search?query=${encodeURIComponent(text)}`);
    search = res.data.result?.[0];
    if (!search) throw new Error("No results.");
    title = search.title;
    url = search.url;
  } catch (err) {
    return m.reply("❌ Failed to fetch search result.");
  }

  const apis = [
    `https://api.davidcyriltech.my.id/api/youtube/mp3?url=${url}`,
    `https://api.darkyasiya.repl.co/api/ytmp3?url=${url}`,
    `https://dreaded.site/api/ytdl/mp3?url=${url}`
  ];

  let audioBuffer, fileName;
  for (const api of apis) {
    try {
      const { data } = await axios.get(api);
      const dl = data.result?.audio || data.result?.url || data.url;
      const audioRes = await axios.get(dl, { responseType: "arraybuffer" });
      audioBuffer = audioRes.data;
      fileName = `${title}.mp3`;
      break;
    } catch (e) {
      continue;
    }
  }

  if (!audioBuffer) return m.reply("❌ All APIs failed. Try again later.");

  const now = moment().tz(config.timezone);
  const timestamp = now.format("HH:mm");
  const date = now.format("dddd, MMMM D YYYY");

  const vcard = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: botName,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${botName};;;\nFN:${botName}\nORG:Powered by Pkdriller\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`
      }
    }
  };

  const contextInfo = {
    externalAdReply: {
      title: `${botName} Music Downloader`,
      body: `🎶 ${title}`,
      thumbnail: await conn.fetchImageBuffer(menuImage),
      mediaType: 2,
      mediaUrl: url,
      sourceUrl: url
    },
    forwardedNewsletterMessageInfo: {
      newsletterName: botName,
      newsletterJid: "120363183547395350@newsletter"
    }
  };

  await conn.sendMessage(m.chat, {
    audio: audioBuffer,
    fileName,
    mimetype: 'audio/mp4',
    ptt: false,
    contextInfo,
  }, { quoted: vcard });
});
    
