const { cmd } = require('../command')
const config = require('../config')
const axios = require('axios')

cmd({
  pattern: "play",
  desc: "Download audio from YouTube",
  category: "Music",
  filename: __filename,
  use: "<song name>",
  react: "🎵",
  fromMe: false
}, async (m, text, conn, msgHandler) => {
  if (!text) return m.reply('*🔎 Please provide a song name!*')

  const qmsg = {
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

  const infoMsg = `🎧 *Song Search:* ${text}\n\n🔰 Choose source:\n1️⃣ apis-keith\n2️⃣ siputzx\n3️⃣ dreaded.site\n\n_Send 1, 2 or 3 to choose source_`
  await conn.sendMessage(m.chat, { text: infoMsg }, { quoted: qmsg })

  const handler = async (res) => {
    if (!res.message || res.key.remoteJid !== m.chat || res.key.fromMe) return

    const selected = res.message.conversation?.trim()
    if (!['1', '2', '3'].includes(selected)) {
      await conn.sendMessage(m.chat, { text: '*❌ Invalid choice. Please reply with 1, 2 or 3 only.*' }, { quoted: res })
      return
    }

    let apiUrl
    switch (selected) {
      case '1':
        apiUrl = `https://apis-keith.vercel.app/api/youtube/playmp3?q=${encodeURIComponent(text)}`
        break
      case '2':
        apiUrl = `https://api.siputzx.my.id/api/dl/playmp3?text=${encodeURIComponent(text)}`
        break
      case '3':
        apiUrl = `https://dreaded.site/api/yt/playmp3?text=${encodeURIComponent(text)}`
        break
    }

    try {
      const { data } = await axios.get(apiUrl)
      const title = data.title || 'Music'
      const url = data.url || data.result?.url || data.result
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
    } catch (err) {
      console.error(err)
      return m.reply('*⚠️ Failed to download audio. Try another source.*')
    } finally {
      conn.ev.off('messages.upsert', listener)
    }
  }

  const listener = ({ messages }) => {
    if (!messages[0]) return
    handler(messages[0])
  }

  conn.ev.on('messages.upsert', listener)

  // Optional timeout (auto-remove listener after 30 seconds)
  setTimeout(() => conn.ev.off('messages.upsert', listener), 30000)
})
                             
