const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "play",
    alias: ["mp3", "ytmp3"],
    react: "🎶",
    desc: "Auto-download song in 3 formats",
    category: "download",
    use: ".play <text or YT link>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;
        let videoData;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            videoData = searchResults.results[0];
            id = videoData.videoId;
        } else {
            const searchResults = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
            if (!searchResults?.results?.length) return await reply("❌ Failed to fetch video!");
            videoData = searchResults.results[0];
        }

        const preload = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
        const downloadUrl = preload?.result?.download?.url;

        if (!downloadUrl) return await reply("❌ Failed to get download link!");

        const { title, image, timestamp, views, ago, author, url } = videoData;

        const caption = `🎶 *${title || "Unknown"}*\n` +
            `⏳ ${timestamp || "-"} | 👀 ${views || "-"} | 🧑 ${author?.name || "-"}\n` +
            `🌐 ${url || "-"}\n\n` +
            `${config.FOOTER || "*powered by pkdriller*"}`;

        // Send image preview first
        await conn.sendMessage(from, { image: { url: image }, caption }, { quoted: mek });

        // 1. 🎧 Audio Message
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: mek });

        // 2. 🗣️ PTT Voice Note
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            ptt: true,
            fileName: `${title}.mp3`
        }, { quoted: mek });

        // 3. 📁 Document Upload
        await conn.sendMessage(from, {
            document: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: `📁 ${title}`
        }, { quoted: mek });

        await reply("✅ *All formats uploaded successfully!*");

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ Error: ${error.message || "Something went wrong."}`);
    }
});
