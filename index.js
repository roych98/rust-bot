require('dotenv').config();
const _ = require('lodash');
const RustPlus = require('@liamcottle/rustplus.js');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const Bot = require('./utils/Bot');

const providersConfig = require('./rust.servers.config');

const discordBot = new Bot();

(async (args) => {
  const serverProvider = args[2];
  const serverType = args[3];

  const availableProviders = _.keys(providersConfig);
  if (!_.includes(availableProviders, serverProvider)) {
    console.error(`Bad provider: syntax: npm start <${_.join(availableProviders, ', ')}>`);
    return;
  }

  const providerConfig = providersConfig[serverProvider];
  const availableServers = _.keys(providerConfig.servers);

  if (!_.includes(availableServers, serverType)) {
    console.error(`Bad server type: syntax: npm start <${_.join(availableServers, ', ')}>`);
    return;
  }

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
    console.error(e);
    process.exit(1);
  }
})(process.argv);
