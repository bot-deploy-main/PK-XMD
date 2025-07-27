const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');
const ytSearch = require('yt-search');

cmd({
  pattern: "play",
  alias: ["song", "audio", "mp3", "playdoc"],
  desc: "Play music from YouTube, Spotify or SoundCloud",
  category: "main",
  filename: __filename,
  react: "🎵"
}, async (conn, m, msg, { q, sender, from, reply }) => {

  if (!q) return reply("Please provide a song name or URL.");

  // Platforms
  const query = q;
  const platforms = [];
  if (query.includes('youtube.com') || query.includes('youtu.be')) platforms.push('youtube');
  if (query.includes('soundcloud.com')) platforms.push('soundcloud');
  if (query.includes('spotify.com')) platforms.push('spotify');
  if (platforms.length === 0) platforms.push('youtube', 'soundcloud', 'spotify');

  let track = null;
  let downloadData = null;

  // Search functions
  const searchYouTube = async (query) => {
    const { videos } = await ytSearch(query);
    return videos?.length ? {
      platform: 'youtube',
      title: videos[0].title,
      url: videos[0].url,
      thumbnail: videos[0].thumbnail
    } : null;
  };

  const searchSoundCloud = async (query) => {
    const res = await axios.get(`https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`);
    const tracks = res.data?.result?.result?.filter(track => track.timestamp) || [];
    return tracks.length ? {
      platform: 'soundcloud',
      title: tracks[0].title,
      url: tracks[0].url,
      thumbnail: tracks[0].thumbnail || ""
    } : null;
  };

  const searchSpotify = async (query) => {
    const res = await axios.get(`https://apis-keith.vercel.app/search/spotify?q=${encodeURIComponent(query)}`);
    const result = res.data?.result?.[0];
    return result ? {
      platform: 'spotify',
      title: result.title,
      url: result.url,
      artist: result.artists,
      thumbnail: result.image
    } : null;
  };

  // Download functions
  const downloadYouTube = async (url) => {
    const res = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(url)}`);
    return res.data?.result?.downloadUrl ? {
      downloadUrl: res.data.result.downloadUrl,
      format: 'mp3'
    } : null;
  };

  const downloadSoundCloud = async (url) => {
    const res = await axios.get(`https://apis-keith.vercel.app/download/soundcloud?url=${encodeURIComponent(url)}`);
    return res.data?.result?.track?.downloadUrl ? {
      downloadUrl: res.data.result.track.downloadUrl,
      format: 'mp3'
    } : null;
  };

  const downloadSpotify = async (url) => {
    const res = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(url)}`);
    return res.data?.data?.download ? {
      downloadUrl: res.data.data.download,
      format: 'mp3',
      artist: res.data.data.artis,
      thumbnail: res.data.data.image
    } : null;
  };

  // Search and Download loop
  for (const platform of platforms) {
    try {
      const searchFn = { youtube: searchYouTube, soundcloud: searchSoundCloud, spotify: searchSpotify }[platform];
      const downloadFn = { youtube: downloadYouTube, soundcloud: downloadSoundCloud, spotify: downloadSpotify }[platform];

      track = await searchFn(query);
      if (!track) continue;

      downloadData = await downloadFn(track.url);
      if (downloadData) break;
    } catch (e) {
      console.log(`[${platform} Error]`, e);
      continue;
    }
  }

  if (!track || !downloadData) return reply("❌ Could not download from any platform.");

  // Construct contextInfo
  const fakeVCard = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: "WhatsApp",
        vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp Verified\nORG:WhatsApp Inc.\nTEL;type=CELL;type=VOICE;waid=447710173736:+44 7710 173736\nEND:VCARD"
      }
    }
  };

  const contextInfo = {
    quoted: fakeVCard,
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363313124070136@newsletter",
      newsletterName: "PK-XMD Music",
      serverMessageId: Math.floor(100000 + Math.random() * 999999)
    },
    externalAdReply: {
      title: track.title.length > 25 ? track.title.slice(0, 22) + "..." : track.title,
      body: "Now Playing via PK-XMD",
      thumbnailUrl: downloadData.thumbnail || track.thumbnail || config.LOGO_URL,
      mediaType: 1,
      renderLargerThumbnail: true,
      sourceUrl: track.url,
      showAdAttribution: true
    }
  };

  const artist = downloadData.artist || track.artist || "Unknown Artist";
  const fileName = `${track.title} - ${artist}.${downloadData.format}`.replace(/[^\w\s.-]/gi, '');

  // Send audio
  await conn.sendMessage(from, {
    audio: { url: downloadData.downloadUrl },
    mimetype: 'audio/mp4',
    contextInfo
  }, { quoted: m });

  // Send as document too
  await conn.sendMessage(from, {
    document: { url: downloadData.downloadUrl },
    mimetype: `audio/${downloadData.format}`,
    fileName,
    caption: `🎶 *${track.title}* by *${artist}* (as document)`,
    contextInfo
  }, { quoted: m });

});
    
