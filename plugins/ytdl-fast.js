const { cmd } = require('../command');
const config = require('../config');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

cmd({
    pattern: "play", // separate from "play" to test first
    alias: ["playmenu", "songx"],
    react: "🎶",
    desc: "Download YouTube song via source menu",
    category: "main",
    use: '.playx <query>',
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, q }) => {
    try {
        if (!q) return reply("Please provide a song name or YouTube link.");

        const yt = await ytsearch(q);
        if (!yt.results.length) return reply("No results found!");

        const song = yt.results[0];
        const searchMsg = `🎧 *Song:* ${song.title}\n\n🔰 Choose Source:\n1️⃣ apis-keith\n2️⃣ siputzx\n3️⃣ dreaded.site\n\n_Reply with 1, 2 or 3 within 30s_`;

        await conn.sendMessage(from, { text: searchMsg }, { quoted: mek });

        const handler = async ({ messages }) => {
            const res = messages[0];
            if (!res.message || res.key.remoteJid !== from || res.key.fromMe) return;
            const response = res.message?.conversation?.trim();

            if (!['1', '2', '3'].includes(response)) {
                await conn.sendMessage(from, { text: "❌ Invalid choice. Reply with 1, 2, or 3 only." }, { quoted: res });
                return;
            }

            let apiUrl;
            if (response === '1') {
                apiUrl = `https://apis-keith.vercel.app/api/youtube/playmp3?q=${encodeURIComponent(q)}`;
            } else if (response === '2') {
                apiUrl = `https://api.siputzx.my.id/api/dl/playmp3?text=${encodeURIComponent(q)}`;
            } else if (response === '3') {
                apiUrl = `https://dreaded.site/api/yt/playmp3?text=${encodeURIComponent(q)}`;
            }

            conn.ev.off('messages.upsert', listener); // clean up

            const resData = await fetch(apiUrl);
            const data = await resData.json();
            const dlUrl = data.url || data.result?.url || data.result?.downloadUrl;

            if (!dlUrl) return reply("❌ Failed to retrieve audio URL. Try another source.");

            await conn.sendMessage(from, {
                audio: { url: dlUrl },
                mimetype: "audio/mpeg",
                fileName: `${song.title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        title: song.title.length > 25 ? `${song.title.substring(0, 22)}...` : song.title,
                        body: "Via Source Selector",
                        thumbnailUrl: song.thumbnail.replace('default.jpg', 'hqdefault.jpg'),
                        sourceUrl: config.channel || 'https://whatsapp.com/channel/0029Vad7YNyJuyA77CtIPX0x',
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: mek });
        };

        const listener = conn.ev.on('messages.upsert', handler);

        // Remove after 30 seconds
        setTimeout(() => conn.ev.off('messages.upsert', handler), 30000);
    } catch (err) {
        console.error(err);
        reply("⚠️ Something went wrong. Please try again.");
    }
});
              
