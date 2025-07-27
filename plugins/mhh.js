const { cmd } = require('../command')
const config = require('../config')
const axios = require('axios')

const insults = [
  "You're as useless as the 'ueue' in 'queue'.",
  "Your secrets are always safe with me. I never even listen when you tell me them.",
  "You're the reason shampoo has instructions.",
  "You're not stupid; you just have bad luck thinking.",
  "You're as sharp as a marble.",
  "You bring everyone so much joy… when you leave the room.",
  "You have something on your chin... no, the third one down.",
  "If I had a dollar for every smart thing you say, I’d be broke.",
  "You're proof that even evolution takes a break sometimes.",
  "Your brain is like a web browser—19 tabs open, 17 frozen, and you have no idea where the music is coming from."
]

cmd({
  pattern: "insult",
  alias: ["roast", "joke"],
  desc: "Send a random insult",
  category: "fun",
  filename: __filename,
  react: "😈"
}, async (conn, m, store, { reply }) => {
  try {
    const randomInsult = insults[Math.floor(Math.random() * insults.length)]
    
    const vcard = {
      displayName: "WhatsApp User",
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:WhatsApp;User;;;\nFN:WhatsApp User\nORG:WhatsApp\nTITLE:\nitem1.TEL;type=CELL:+14155238886\nitem1.X-ABLabel:Mobile\nPHOTO;VALUE=URI;TYPE=JPEG:https://static.whatsapp.net/rsrc.php/v3/yz/r/iW-luU6o42O.png\nEND:VCARD`
    }

    const quotedContactMsg = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "WhatsApp Official",
          vcard: vcard.vcard
        }
      }
    }

    const externalAd = {
      showAdAttribution: true,
      title: "🔥 PK-XMD Bot",
      body: "Powered by Pkdriller",
      mediaType: 1,
      thumbnailUrl: "https://files.catbox.moe/glt48n.jpg",
      sourceUrl: "https://wa.me/254718241545",
      renderLargerThumbnail: true
    }

    await conn.sendMessage(m.chat, {
      text: `*💢 Random Insult:*\n\n${randomInsult}`,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 999,
        externalAdReply: externalAd,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363288304618280@newsletter",
          newsletterName: "PK-XMD Official Channel",
          serverMessageId: Date.now()
        }
      }
    }, { quoted: quotedContactMsg })
  } catch (e) {
    console.error(e)
    reply("❌ Error while generating insult.")
  }
})
      
