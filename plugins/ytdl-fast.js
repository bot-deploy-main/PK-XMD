const { cmd } = require('../command');
const config = require('../config');
const axios = require('axios');
const fs = require('fs');
const { getBuffer } = require('../lib/functions');

cmd({
  pattern: "play",
  desc: "Download YouTube music by name",
  category: "Download",
  filename: __filename,
  use: "<song name>",
  react: "🎧",
  fromMe: false
}, async (m, q, conn) => {
  if (!q) return m.reply("*🎵 Enter a song name to play!*");

  // Fake Verified Quoted Contact
  const fakeContact = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'F1A2E3D4B5C6'
    },
    message: {
      contactMessage: {
        displayName: "WhatsApp Music",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp Music\nORG:WhatsApp Inc.\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`
      }
    }
  };

  // Try Source 1 - apis-keith
  try {
    let res = await axios.get(`https://apis-keith.vercel.app/api/ytplaymp3?q=${encodeURIComponent(q)}`);
    if (!res?.data?.result?.url) throw "❌ Failed at source 1";

    let { title, url, duration, thumb } = res.data.result;
    let buffer = await getBuffer(url);

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mp4',
      ptt: false,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: `${title}`,
          body: `Powered by Pkdriller`,
          mediaType: 2,
          thumbnail: await getBuffer(thumb),
          mediaUrl: url,
          sourceUrl: url,
          showAdAttribution: true
        },
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363025076059663@newsletter",
          newsletterName: "PK-XMD NEWS",
          serverMessageId: 100
        }
      }
    }, { quoted: fakeContact });

    return;
  } catch (e) {
    console.log("Source 1 failed:", e.message || e);
  }

  // Try Source 2 - siputzx
  try {
    let res = await axios.get(`https://api.siputzx.my.id/api/search/ytplaymp3?text=${encodeURIComponent(q)}`);
    if (!res?.data?.url) throw "❌ Failed at source 2";

    let { title, url, thumbnail } = res.data;
    let buffer = await getBuffer(url);

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mp4',
      ptt: false,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: `${title}`,
          body: `Powered by Pkdriller`,
          mediaType: 2,
          thumbnail: await getBuffer(thumbnail),
          mediaUrl: url,
          sourceUrl: url,
          showAdAttribution: true
        },
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363025076059663@newsletter",
          newsletterName: "PK-XMD NEWS",
          serverMessageId: 100
        }
      }
    }, { quoted: fakeContact });

    return;
  } catch (e) {
    console.log("Source 2 failed:", e.message || e);
  }

  // Try Source 3 - dreaded.site
  try {
    let res = await axios.get(`https://dreaded.site/api/ytplaymp3?query=${encodeURIComponent(q)}`);
    if (!res?.data?.url) throw "❌ Failed at source 3";

    let { title, url, thumbnail } = res.data;
    let buffer = await getBuffer(url);

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mp4',
      ptt: false,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: `${title}`,
          body: `Powered by Pkdriller`,
          mediaType: 2,
          thumbnail: await getBuffer(thumbnail),
          mediaUrl: url,
          sourceUrl: url,
          showAdAttribution: true
        },
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363025076059663@newsletter",
          newsletterName: "PK-XMD NEWS",
          serverMessageId: 100
        }
      }
    }, { quoted: fakeContact });

    return;
  } catch (e) {
    console.log("Source 3 failed:", e.message || e);
    return m.reply("❌ All sources failed. Try again later.");
  }
});
      
