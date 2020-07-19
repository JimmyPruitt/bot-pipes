require('dotenv').config();

const functions = require('./functions');
const Discord = require('discord.js');
const bot = new Discord.Client();

bot.login(process.env.DISCORD_TOKEN);
bot.on('ready', () => {
    bot.user.setStatus('invisible');
});

bot.on('message', async message => {
  if (message.channel.type !== 'dm') return;
  if (message.author.id !== process.env.DISCORD_USER_ID) return;

  try {
    switch (true) {
        case (!!message.content.match(/^\/join(\s|$)/)):
            return functions.joinChannel(message, bot);
        case (!!message.content.match(/\/start$/)):
            return functions.startMusic(bot);
        case (!!message.content.match(/\/stop$/)):
            return functions.stopMusic(bot);
        default:
            message.reply('Valid commands are: join, start, stop');
    }
  } catch (e) {
    console.error(e);
  }
});