const { cmd } = require('../command')
const config = require('../config')
const axios = require('axios')
const fs = require('fs')
const cheerio = require('cheerio')

cmd({
  pattern: "play",
  desc: "Download audio from YouTube",
  category: "Music",
  filename: __filename,
  use: "<song name>",
  react: "🎵",
  fromMe: false
}, async (m, text, conn) => {
  if (!text) return m.reply('*🔎 Please provide a song name!*')

  let qmsg = {
    key: {
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: "WhatsApp",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp Verified\nORG:WhatsApp Inc.\nTEL;type=CELL;type=VOICE;waid=447710173736:+44 7710 173736\nEND:VCARD`
      }
    }
  }

  let infoMsg = `🎧 *Song Search:* ${text}\n\n🔰 Choose source:\n1️⃣ apis-keith\n2️⃣ siputzx\n3️⃣ dreaded.site\n\n_Send 1, 2 or 3 to choose source_`
  let prompt = await conn.sendMessage(m.chat, { text: infoMsg }, { quoted: qmsg })

  conn.awaitMessages(
    m.chat,
    async (resMsg) => {
      let selected = resMsg.body.trim()
      let apiUrl
      if (selected === '1') {
        apiUrl = `https://apis-keith.vercel.app/api/youtube/playmp3?q=${encodeURIComponent(text)}`
      } else if (selected === '2') {
        apiUrl = `https://api.siputzx.my.id/api/dl/playmp3?text=${encodeURIComponent(text)}`
      } else if (selected === '3') {
        apiUrl = `https://dreaded.site/api/yt/playmp3?text=${encodeURIComponent(text)}`
      } else {
        return conn.sendMessage(m.chat, { text: '*❌ Invalid choice. Please reply with 1, 2 or 3 only.*' }, { quoted: resMsg })
      }

      try {
        let { data } = await axios.get(apiUrl)
        let title = data.title || 'Music'
        let url = data.url || data.result?.url || data.result
        if (!url) return m.reply('*❌ Failed to get audio link.*')

        await conn.sendMessage(m.chat, {
          audio: { url },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title: "Now Playing 🎶",
              body: "Powered by Pkdriller",
              thumbnailUrl: "https://files.catbox.moe/glt48n.jpg",
              mediaType: 1,
              renderLargerThumbnail: true,
              showAdAttribution: true,
              sourceUrl: config.channel || "https://whatsapp.com/channel/0029VaEHtKbGZh5jv40qxk0D",
            },
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363204318084784@newsletter',
              newsletterName: config.botname,
              serverMessageId: 100
            }
          }
        }, { quoted: qmsg })

      } catch (e) {
        console.log(e)
        return m.reply('*⚠️ Failed to download audio. Try another source.*')
      }
    },
    {
      max: 1,
      time: 30000,
      errors: ['timeout']
    }
  )
})
        
