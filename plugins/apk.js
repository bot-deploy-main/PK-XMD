const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

cmd({
  pattern: "apk",
  alias: ["app", "aptoide"],
  desc: "Download APK from Aptoide",
  category: "Downloader",
  filename: __filename,
  react: "📦"
}, async (conn, m, store, { from, q, react }) => {
  try {
    if (!q) return m.reply("❌ Please provide the name of the app.\nExample: `.apk Instagram`");

    await react("⏳");

    const res = await axios.get(`http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`);
    const data = res.data;

    if (!data?.datalist?.list?.length) {
      return m.reply("⚠️ No results found for the app you searched.");
    }

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2); // MB

    const caption = `╭─❖  *APK Downloader*
┃ 📦 *Name:* ${app.name}
┃ 📁 *Size:* ${appSize} MB
┃ 📦 *Package:* ${app.package}
┃ 🗓 *Updated:* ${app.updated}
┃ 👨‍💻 *Developer:* ${app.developer.name}
╰─────────────⭓
*Powered by Pkdriller*`;

    const fakeVCard = {
      key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "WhatsApp",
          vcard: `
BEGIN:VCARD
VERSION:3.0
FN:WhatsApp Verified
ORG:WhatsApp Inc.
TEL;type=CELL;type=VOICE;waid=14155238886:+1 (415) 523-8886
END:VCARD`
        }
      }
    };

    const thumbPath = path.join(__dirname, '../media/logo.jpg');
    const thumbnail = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null;

    await conn.sendMessage(from, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: caption,
      contextInfo: {
        quotedMessage: fakeVCard.message,
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363288304618280@newsletter",
          serverMessageId: "",
          newsletterName: config.botName || "PK-XMD"
        },
        externalAdReply: {
          title: app.name,
          body: "APK Downloader by Pkdriller",
          thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: app.store ? app.store.url : "https://aptoide.com"
        }
      }
    }, { quoted: fakeVCard });

    await react("✅");
  } catch (e) {
    console.error(e);
    m.reply("❌ An error occurred while downloading the APK.");
  }
});
