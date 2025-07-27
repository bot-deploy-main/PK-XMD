const axios = require("axios");
const { cmd } = require('../command');
const config = require('../config');
const fs = require('fs');

cmd({
  pattern: "insult",
  alias: ["roast", "abuse"],
  desc: "Send a random insult",
  category: "fun",
  filename: __filename,
  react: "🗣️"
}, async (conn, m, store, { from, quoted, args, q, reply }) => {
  try {
    const res = await axios.get("https://insult.mattbas.org/api/insult");
    const insult = res.data;

    // Fake verified vCard contact
    const fakeContact = {
      key: {
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "PKXMD-FAKE-VCARD"
      },
      message: {
        contactMessage: {
          displayName: "WhatsApp User",
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:WhatsApp;User;;;\nFN:WhatsApp User\nitem1.TEL;waid=254700000000:+254 700 000000\nitem1.X-ABLabel:Mobile\nitem2.EMAIL;type=INTERNET:verified@support.whatsapp.net\nitem2.X-ABLabel:Verified\nEND:VCARD`
        }
      }
    };

    await conn.sendMessage(from, {
      text: `*🔥 RANDOM INSULT 🔥*\n\n_${insult}_`,
      contextInfo: {
        externalAdReply: {
          title: "Powered by Pkdriller",
          body: config.botname + " • Insult Generator",
          mediaType: 1,
          thumbnail: fs.readFileSync('https://files.catbox.moe/glt48n.jpg'), // Replace with your preferred thumbnail
          mediaUrl: "https://whatsapp.com/channel/0029VaGVz1k9JNBmZxxU763i", // Optional
          sourceUrl: "https://github.com/pkdriller"
        },
        forwardedNewsletterMessageInfo: {
          newsletterJid: ".120363288304618280@newsletter",
          newsletterName: config.botname,
          serverMessageId: 100
        }
      }
    }, { quoted: fakeContact });

  } catch (e) {
    console.error(e);
    reply("❌ Failed to fetch insult.");
  }
});
  
