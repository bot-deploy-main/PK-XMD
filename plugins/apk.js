const axios = require("axios");
const { cmd } = require("../command");
const config = require("../config");

cmd({
  pattern: "apk",
  desc: "Download APK from Aptoide",
  category: "download",
  filename: __filename,
  use: "<app name>",
  react: "📦"
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide the app name to search.");

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
    const { data } = await axios.get(apiUrl);

    if (!data?.datalist?.list?.length) return reply("⚠️ No results found for that app name.");

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2); // MB

    const caption = `╭───⪩ *APK Downloader* ⪨───╮
┃ 📦 *Name:* ${app.name}
┃ 🏷️ *Package:* ${app.package}
┃ 💾 *Size:* ${appSize} MB
┃ 🧑‍💻 *Developer:* ${app.developer.name}
┃ 🗓️ *Updated:* ${app.updated}
╰───────────────────────⪧
_Powered by Pkdriller - PK-XMD_`;

    await conn.sendMessage(from, { react: { text: "⬇️", key: m.key } });

    await conn.sendMessage(from, {
      document: { url: app.file.path_alt },
      mimetype: 'application/vnd.android.package-archive',
      fileName: `${app.name}.apk`,
      caption: caption,
      contextInfo: {
        quotedMessage: {
          contactMessage: {
            displayName: "WhatsApp Verified",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp Verified\nORG:Meta Verified Inc.\nTEL;type=CELL;waid=254700000000:+254 700 000000\nEND:VCARD`
          }
        },
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "PK-XMD scanned and approved",
          newsletterJid: "120363288304618280@newsletter",
        },
        externalAdReply: {
          title: "APK Downloader",
          body: "Get Android apps via Aptoide",
          thumbnailUrl: "https://files.catbox.moe/glt48n.jpg",
          sourceUrl: "https://aptoide.com",
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while fetching the APK.");
  }
});
            
