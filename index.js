require('dotenv').config();
const RustPlus = require('@liamcottle/rustplus.js');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const Bot = require('./utils/Bot');

const discordBot = new Bot();

(async (args) => {
  const serverProvider = args[0];
  const serverType = args[1];

  const providerConfig = _.get(require('./rust.servers.config.json'), `${serverProvider}`);
  const serverConfig = _.get(providerConfig.servers, `${serverType}`);
  try {
    const rustplus = new RustPlus(serverConfig.ip, serverConfig.port, process.env.PLAYER_ID, process.env.PLAYER_TOKEN);
    await discordBot.init();
    rustplus.on('connected', () => {
      console.log('test');
    });

    // connect to rust server
    rustplus.connect();
  } catch (e) {
  }
})(process.env.args);
