const { cmd } = require('../command');
const config = require('../config');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

cmd({
    pattern: "play",
    alias: ["song", "mp3"],
    react: "🎶",
    desc: "Download song from 3 APIs",
    category: "main",
    use: '.play <query>',
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("Please provide a song name or YouTube link.");

        const yt = await ytsearch(q);
        if (!yt.results.length) return reply("No results found!");

        const song = yt.results[0];
        const apis = [
            {
                name: 'apis-keith',
                url: `https://apis-keith.vercel.app/api/youtube/playmp3?q=${encodeURIComponent(q)}`,
                sendAs: 'audio' // standard audio
            },
            {
                name: 'siputzx',
                url: `https://api.siputzx.my.id/api/dl/playmp3?text=${encodeURIComponent(q)}`,
                sendAs: 'document' // send as document
            },
            {
                name: 'dreaded',
                url: `https://dreaded.site/api/yt/playmp3?text=${encodeURIComponent(q)}`,
                sendAs: 'ptt' // send as voice/ptt
            }
        ];

        for (const api of apis) {
            try {
                const res = await fetch(api.url);
                const data = await res.json();

                const audioUrl = data.url || data.result?.url || data.result?.downloadUrl;
                if (!audioUrl) {
                    await reply(`⚠️ Failed from ${api.name}`);
                    continue;
                }

                let caption = `🎧 *${song.title}*\n🔗 From: ${api.name}\n> Powered by pk-tech inc`;

                const options = {
                    quoted: mek,
                    contextInfo: {
                        externalAdReply: {
                            title: song.title.length > 25 ? `${song.title.substring(0, 22)}...` : song.title,
                            body: `From ${api.name}`,
                            thumbnailUrl: song.thumbnail.replace('default.jpg', 'hqdefault.jpg'),
                            sourceUrl: config.channel || 'https://whatsapp.com/channel/0029Vad7YNyJuyA77CtIPX0x',
                            showAdAttribution: true,
                            renderLargerThumbnail: true
                        }
                    }
                };

                // Send based on mode
                if (api.sendAs === 'audio') {
                    await conn.sendMessage(from, {
                        audio: { url: audioUrl },
                        mimetype: "audio/mpeg",
                        fileName: `${song.title}.mp3`,
                        caption
                    }, options);
                } else if (api.sendAs === 'document') {
                    await conn.sendMessage(from, {
                        document: { url: audioUrl },
                        mimetype: "audio/mpeg",
                        fileName: `${song.title} [${api.name}].mp3`,
                        caption
                    }, options);
                } else if (api.sendAs === 'ptt') {
                    await conn.sendMessage(from, {
                        audio: { url: audioUrl },
                        mimetype: "audio/mpeg",
                        ptt: true,
                        fileName: `${song.title}.mp3`
                    }, options);
                }

            } catch (e) {
                console.error(`Error from ${api.name}:`, e.message);
                await reply(`❌ API ${api.name} failed.`);
            }
        }

    } catch (err) {
        console.error(err);
        reply("⚠️ Error occurred. Try again.");
    }
});
                      
