const ytdl = require('ytdl-core');
const musicStreams = [];
const split = require('split-string');

function findChannel(server, channel, bot) {
    for (const entry of bot.channels.cache) {
        const [id, channelObject] = entry;
        if (channelObject.type !== 'voice') {
            continue;
        }


        if (channelObject.name.toLowerCase() === channel.toLowerCase()) {
            if (channelObject.guild.name.toLowerCase() === server.toLowerCase()) {
                return channelObject;
            }
        }
    }
}

module.exports = {
    async joinChannel(message, bot) {
        const args = split(message.content, {
            separator: ' ',
            quotes: ['"', `'`, '`']
        });

        if (!args || !args[1] || !args[2]) {
            return message.reply('Usage: /join <server name> <channel name>');
        }

        const server = args[1].replace(/['"`]/g, '');
        const channel = args[2].replace(/['"`]/g, '');
        try {
            const serverChannel = findChannel(server, channel, bot);
            if (!serverChannel) {
                throw new Error(`I have no knowledge/access to channel ${server}:${channel}`);
            } else if (!serverChannel.joinable) {
                throw new Error(`Channel ${server}:${channel} is not joinable`);
            }

            await serverChannel.join();
        } catch (e) {
            message.reply(e.message);
        }
    },

    startMusic(bot) {
        for (const entry of bot.voice.connections) {
            const [_, connection] = entry;
            const youtubeVideo = ytdl('https://www.youtube.com/watch?v=mDGt9XiOGSo', { filter: 'audioonly' })
            const stream = connection.play(youtubeVideo, { volume: 0.5 }).on('finish', () => {
                musicStreams.splice(musicStreams.indexOf(stream), 1);
                stream.destroy();
                this.startMusic(bot);
            });

            musicStreams.push(stream);
        }
    },

    stopMusic() {
        let stream;
        while (stream = musicStreams.pop()) {
            stream.destroy();
        }
    }
}