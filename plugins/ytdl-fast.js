const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function extractYouTubeID(url) {
  const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

cmd({
  pattern: "play",
  alias: ["mp3", "ytmp3"],
  react: "🎶",
  desc: "Download song as audio, document & voice note",
  category: "download",
  use: "*play <song name or YouTube link>",
  filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
  try {
    if (!q) return await reply("❌ Please provide a song name or YouTube URL!");

    let id = q.startsWith("http") ? extractYouTubeID(q) : null;
    let videoData;

    if (!id) {
      const search = await dy_scrap.ytsearch(q);
      if (!search?.results?.length) return await reply("❌ No results found!");
      videoData = search.results[0];
      id = videoData.videoId;
    } else {
      const search = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
      if (!search?.results?.length) return await reply("❌ Failed to fetch video info!");
      videoData = search.results[0];
    }

    const audioData = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
    const downloadUrl = audioData?.result?.download?.url;
    if (!downloadUrl) return await reply("❌ Failed to get download URL!");

    const { title, image, timestamp, views, ago, author, url } = videoData;
    const caption = `🎵 *Title:* ${title || "-"}\n⏳ *Duration:* ${timestamp || "-"}\n👤 *Author:* ${author?.name || "-"}\n👀 *Views:* ${views || "-"}\n📅 *Released:* ${ago || "-"}\n🔗 *Link:* ${url || "-"}`;

    // 1. Image + info
    await conn.sendMessage(from, {
      image: { url: image },
      caption
    }, { quoted: mek });

    // 2. Normal Audio
    await conn.sendMessage(from, {
      audio: { url: downloadUrl },
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    }, { quoted: mek });

    // 3. Voice Note (PTT)
    await conn.sendMessage(from, {
      audio: { url: downloadUrl },
      mimetype: "audio/mpeg",
      ptt: true,
      fileName: `${title}.mp3`
    }, { quoted: mek });

    // 4. As Document
    await conn.sendMessage(from, {
      document: { url: downloadUrl },
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      caption: `📁 ${title}`
    }, { quoted: mek });

    await reply("✅ Uploaded in all formats!");

  } catch (err) {
    console.error(err);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    await reply(`❌ Error: ${err.message || "Unknown error"}`);
  }
});
        
