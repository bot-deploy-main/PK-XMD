const axios = require("axios");
const { cmd } = require('../command');
const config = require('../config');
const fs = require("fs");

cmd({
  pattern: "mediafire",
  alias: ["mfire"],
  desc: "Download MediaFire files.",
  category: "downloader",
  filename: __filename,
  react: "📥"
}, async (conn, m, store, { from, q, quoted, reply }) => {
  try {
    if (!q) return reply("❌ *Please provide a valid MediaFire link.*");

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const res = await axios.get(`https://www.dark-yasiya-api.site/download/mfire?url=${q}`);
    const data = res.data;

    if (!data?.status || !data?.result?.dl_link) {
      return reply("⚠️ *Failed to fetch file. Make sure your MediaFire link is valid and public.*");
    }

    const { dl_link, fileName, fileType, fileSize } = data.result;
    const file_name = fileName || "mediafire_file";
    const mime_type = fileType || "application/octet-stream";
    const size = fileSize || "Unknown Size";

    const caption = `╭━━━〈 *MEDIAFIRE DOWNLOADER* 〉━━━⬣
┃ 📄 *Name:* ${file_name}
┃ 🔖 *Type:* ${mime_type}
┃ 📦 *Size:* ${size}
╰━━━━━━━━━━━━━━━━━━⬣
📥 *Sending your file...*`;

    const fakeVCard = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "WhatsApp Channel",
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp Channel\nORG:P.K.Driller Official;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
          jpegThumbnail: fs.readFileSync('./media/logo.jpg') // optional
        }
      }
    };

    await conn.sendMessage(from, {
      document: { url: dl_link },
      mimetype: mime_type,
      fileName: file_name,
      caption: caption,
      contextInfo: {
        externalAdReply: {
          title: "MediaFire File Downloader",
          body: config.botName + " | Powered by Pkdriller",
          thumbnailUrl: "https://files.catbox.moe/glt48n.jpg",
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          sourceUrl: q
        },
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363288304618280@newsletter",
          newsletterName: config.botName,
          serverMessageId: 100
        }
      }
    }, { quoted: fakeVCard });

  } catch (e) {
    console.error(e);
    reply("❌ *An error occurred while downloading the file.*");
  }
});
