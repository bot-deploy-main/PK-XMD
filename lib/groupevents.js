const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

// Fake verified contact vCard
const fakeVcard = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "WhatsApp",
            vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp Verified\nORG:WhatsApp Inc.\nTEL;type=CELL;type=VOICE;waid=447710173736:+44 7710 173736\nEND:VCARD",
            jpegThumbnail: null
        }
    }
};

// Optional external ad reply info
const adReply = {
    showAdAttribution: true,
    title: config.BOT_NAME,
    body: "Group Notification • " + config.BOT_NAME,
    mediaType: 1,
    renderLargerThumbnail: false,
    thumbnailUrl: ppUrls[0],
    sourceUrl: "https://wa.me/447710173736"
};

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            const contextInfo = {
                quoted: fakeVcard,
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363288304618280@newsletter",
                    newsletterName: config.BOT_NAME,
                    serverMessageId: "",
                },
                externalAdReply: adReply
            };

            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `╭─〔 *🤖 ${config.BOT_NAME}* 〕\n` +
                    `├─▸ *Welcome @${userName} to ${metadata.subject}* 🎉\n` +
                    `├─ *You are member number ${groupMembersCount}* \n` +
                    `├─ *Time joined:* ${timestamp}\n` +
                    `╰─➤ *Please read group description*\n\n` +
                    `╭──〔 📜 *Group Description* 〕\n` +
                    `├─ ${desc}\n` +
                    `╰─🚀 *Powered by ${config.BOT_NAME}*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo
                });

            } else if (update.action === "remove" && config.GOODBYE === "true") {
                const GoodbyeText = `╭─〔 *🤖 ${config.BOT_NAME}* 〕\n` +
                    `├─▸ *Goodbye @${userName}* 😔\n` +
                    `├─ *Time left:* ${timestamp}\n` +
                    `├─ *Members remaining:* ${groupMembersCount}\n` +
                    `╰─➤ *We'll miss you!*\n\n` +
                    `╰─🚀 *Powered by ${config.BOT_NAME}*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `╭─〔 *⚠️ Admin Event* 〕\n` +
                          `├─ @${demoter} demoted @${userName}\n` +
                          `├─ *Time:* ${timestamp}\n` +
                          `├─ *Group:* ${metadata.subject}\n` +
                          `╰─➤ *Powered by ${config.BOT_NAME}*`,
                    mentions: [update.author, num],
                    contextInfo
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `╭─〔 *🎉 Admin Event* 〕\n` +
                          `├─ @${promoter} promoted @${userName}\n` +
                          `├─ *Time:* ${timestamp}\n` +
                          `├─ *Group:* ${metadata.subject}\n` +
                          `╰─➤ *Powered by ${config.BOT_NAME}*`,
                    mentions: [update.author, num],
                    contextInfo
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
            
