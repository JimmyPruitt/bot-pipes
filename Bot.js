const ytdl = require("ytdl-core");
const split = require("split-string");

module.exports = class {
  constructor(discordClient) {
    this.discordClient = discordClient;
    this.musicStreams = [];
  }

  initialize() {
    this.discordClient.login(process.env.DISCORD_TOKEN);
    this.discordClient.on("ready", () => {
      this.discordClient.user.setStatus("invisible");
    });

    this.discordClient.on("message", (message) => {
      if (message.channel.type !== "dm") return;
      if (message.author.id !== process.env.DISCORD_USER_ID) return;

      try {
        switch (true) {
          case !!message.content.match(/^\/join(\s|$)/):
            return this.joinChannel(message);
          case !!message.content.match(/\/start$/):
            return this.startMusic();
          case !!message.content.match(/\/stop$/):
            return this.stopMusic();
          default:
            message.reply("Valid commands are: join, start, stop");
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  async joinChannel(message) {
    const args = split(message.content, {
      separator: " ",
      quotes: ['"', `'`, "`"],
    });

    if (!args || !args[1] || !args[2]) {
      return message.reply("Usage: /join <server name> <channel name>");
    }

    const server = args[1].replace(/['"`]/g, "");
    const channel = args[2].replace(/['"`]/g, "");
    try {
      const serverChannel = findChannel(server, channel);
      if (!serverChannel) {
        throw new Error(
          `I have no knowledge/access to channel ${server}:${channel}`
        );
      } else if (!serverChannel.joinable) {
        throw new Error(`Channel ${server}:${channel} is not joinable`);
      }

      await serverChannel.join();
    } catch (e) {
      message.reply(e.message);
    }
  }

  startMusic() {
    for (const entry of this.discordClient.voice.connections) {
      const [_, connection] = entry;
      const youtubeVideo = ytdl("https://www.youtube.com/watch?v=mDGt9XiOGSo", {
        filter: "audioonly",
      });
      const stream = connection
        .play(youtubeVideo, { volume: 0.5 })
        .on("finish", () => {
          this.musicStreams.splice(this.musicStreams.indexOf(stream), 1);
          stream.destroy();
          this.startMusic(this.discordClient);
        });

      this.musicStreams.push(stream);
    }
  }

  stopMusic() {
    let stream;
    while ((stream = this.musicStreams.pop())) {
      stream.destroy();
    }
  }

  findChannel(server, channel) {
    for (const entry of this.discordClient.channels.cache) {
      const [_, channelObject] = entry;
      if (channelObject.type !== "voice") {
        continue;
      }

      if (channelObject.name.toLowerCase() === channel.toLowerCase()) {
        if (channelObject.guild.name.toLowerCase() === server.toLowerCase()) {
          return channelObject;
        }
      }
    }
  }
};
