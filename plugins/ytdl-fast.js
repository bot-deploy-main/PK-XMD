const config = require('../config');
const { cmd } = require('../command');
const fetch = require('node-fetch');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const { getBuffer } = require('../lib/functions');

cmd({
  pattern: "play",
  alias: ["ytmp3", "yta", "ytmusic"],
  desc: "Download YouTube music",
  category: "Downloader",
  use: '.play < song name >',
  filename: __filename,
  react: "🎵",
  fromMe: false
}, async (conn, m, msg, { q, from, reply, sender }) => {
  try {
    if (!q) return reply("Please provide a song name or YouTube URL!");

    const yt = await ytsearch(q);
    if (!yt.results.length) return reply("No results found!");

    const song = yt.results[0];
    const apis = [
      `https://gifted-api.vercel.app/api/download/ytmp3?url=${encodeURIComponent(song.url)}`,
      `https://gifted-api.vercel.app/api/download/yta?url=${encodeURIComponent(song.url)}`,
      `https://gifted-api.vercel.app/api/download/mp3?url=${encodeURIComponent(song.url)}`
    ];

    let finalUrl = null;
    for (const api of apis) {
      try {
        const res = await fetch(api);
        const json = await res.json();
        if (json.result?.download_url) {
          finalUrl = json.result.download_url;
          break;
        }
      } catch (e) {
        console.log(`❌ API failed: ${api}`);
      }
    }

    if (!finalUrl) return reply("Failed to get audio. Try again later.");

    const menuMsg = {
      image: { url: song.thumbnail },
      caption: `🎧 *PK-XMD SONG DOWNLOADER*\n\n🎵 *Title:* ${song.title}\n🕒 *Duration:* ${song.timestamp}\n👁️ *Views:* ${song.views}\n👤 *Author:* ${song.author.name}\n\n_Reply with:_\n1️⃣ To get *AUDIO* 🎶\n2️⃣ To get as *DOCUMENT* 📄\n\nPowered by Pkdriller`,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: `${song.title}`,
          body: "PK-XMD • Audio Downloader",
          mediaType: 1,
          thumbnailUrl: song.thumbnail,
          sourceUrl: 'https://whatsapp.com/channel/0029Vad7YNyJuyA77CtIPX0x',
          renderLargerThumbnail: true,
          showAdAttribution: true
        },
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363229837888194@newsletter',
          newsletterName: config.botname || 'PK-XMD',
          serverMessageId: 9
        }
      },
      quoted: {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
          remoteJid: "status@broadcast"
        },
        message: {
          contactMessage: {
            displayName: "WhatsApp",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp Verified\nORG:Meta\nTEL;type=CELL;type=VOICE;waid=447710173736:+44 7710 173736\nEND:VCARD`
          }
        }
      }
    };

    const sentMsg = await conn.sendMessage(from, menuMsg);
    const messageId = sentMsg.key.id;

    const handleReply = async (ev) => {
      const rmsg = ev.messages[0];
      if (!rmsg.message) return;
      if (rmsg.key.remoteJid !== from) return;
      if (!rmsg.message?.extendedTextMessage) return;
      const stanzaId = rmsg.message.extendedTextMessage?.contextInfo?.stanzaId;
      if (stanzaId !== messageId) return;

      const text = rmsg.message?.conversation || rmsg.message?.extendedTextMessage?.text;
      const buffer = await getBuffer(finalUrl);
      if (!buffer) return conn.sendMessage(from, { text: "Download failed. Try again later." }, { quoted: rmsg });

      if (text === "1") {
        await conn.sendMessage(from, {
          audio: buffer,
          mimetype: "audio/mpeg",
          fileName: `${song.title}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: song.title,
              body: "PK-XMD • Audio Downloader",
              thumbnailUrl: song.thumbnail,
              mediaType: 1,
              showAdAttribution: true,
              sourceUrl: song.url,
              renderLargerThumbnail: true
            },
            forwardingScore: 500,
            isForwarded: true
          }
        }, { quoted: rmsg });
      } else if (text === "2") {
        await conn.sendMessage(from, {
          document: buffer,
          mimetype: "audio/mpeg",
          fileName: `${song.title}.mp3`,
          caption: song.title
        }, { quoted: rmsg });
      } else {
        await reply("Invalid option. Reply with 1️⃣ or 2️⃣", rmsg);
      }

      conn.ev.off('messages.upsert', handleReply);
    };

    setTimeout(() => {
      conn.ev.off("messages.upsert", handleReply);
    }, 2 * 60 * 1000); // session timeout 2 min

    conn.ev.on("messages.upsert", handleReply);

  } catch (e) {
    console.log(e);
    reply("An error occurred. Please try again.");
  }
});
        
