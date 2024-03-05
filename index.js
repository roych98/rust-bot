require('dotenv').config();
const _ = require('lodash');
const RustPlus = require('@liamcottle/rustplus.js');
const Bot = require('./utils/discordbot/Bot');
const { getAvailableCommands } = require('./utils/commands.utils');

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

  const availableCommands = await getAvailableCommands();
  console.log(`Available commands: ${_.join(availableCommands, ', ')}`);

  const serverConfig = _.get(providerConfig.servers, `${serverType}`);
  try {
    const rustplus = new RustPlus(serverConfig.ip, serverConfig.port, process.env.PLAYER_ID, process.env.PLAYER_TOKEN || args[4]);
    await discordBot.init({ rustCommands: availableCommands, rustbot: rustplus, serverConfig });
    rustplus.on('connected', () => {
      rustplus.sendTeamMessage('Amir is GAY! :skull:');
    });

    rustplus.on('message', (message) => {
      const teamMessage = message.broadcast?.teamMessage?.message?.message;
      if (!teamMessage) return;
      const realCommand = teamMessage.replace('!', '');
      if (!_.includes(availableCommands, realCommand)) return;
      return require(`./commands/${realCommand}`).execute({ rustbot: rustplus, serverConfig, replyInGame: true });
    });

    rustplus.connect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})(process.argv);
