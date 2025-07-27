const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');

cmd({
  pattern: "freebot",
  desc: "Post bot updates and deployment info",
  category: "system",
  react: "📣",
  filename: __filename
}, async (conn, m, store, { from, reply }) => {
  try {
    const fakeContact = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "WhatsApp",
          vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp\nORG:Meta Platforms Inc.\nTEL;type=CELL;type=VOICE;waid=447710173736:+44 7710 173736\nEND:VCARD"
        }
      }
    };

    const contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      externalAdReply: {
        showAdAttribution: true,
        title: "🚀 PK-XMD OFFICIAL BOT UPDATE",
        body: "Deploy your own now!",
        thumbnailUrl: "https://files.catbox.moe/kroie9.jpg",
        sourceUrl: "https://github.com/nexustech1911/PK-XMD",
        mediaType: 1,
        renderLargerThumbnail: true
      },
      forwardedNewsletterMessageInfo: {
        newsletterName: "PK-XMD Bot Channel",
        newsletterJid: "120363288304618280@newsletter"
      }
    };

    const postMessage = `╭─❖  *PK-XMD OFFICIAL UPDATE*  ❖─╮
┃
┃📣 Stay updated with our bot!
┃🧩 Deploy PK-XMD to Heroku, Render, Railway and others.
┃
┃🔗 *GitHub Repo:*
┃ https://github.com/mejjar00254/PK-XMD
┃
┃🌐 *Pairing Site:*
┃ https://pk-v33i.onrender.com
┃
┃📢 Join our Channel:
┃ https://whatsapp.com/channel/0029Vad7YNyJuyA77CtIPX0x
┃
╰─ Powered by *Pkdriller* ─╯`;

    await conn.sendMessage(from, {
      text: postMessage,
      contextInfo
    }, { quoted: fakeContact });

  } catch (e) {
    console.error(e);
    reply("❌ Failed to send post update.");
  }
});
