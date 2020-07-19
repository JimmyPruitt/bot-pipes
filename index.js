require('dotenv').config();

const Discord = require('discord.js');
const Bot = require('./Bot');
const bot = new Bot(new Discord.Client());

bot.initialize();