require('dotenv').config();
const _ = require('lodash');
const RustPlus = require('@liamcottle/rustplus.js');
const Bot = require('./utils/discordbot/Bot');
const { getAvailableCommands } = require('./utils/commands.utils');
const { getGridData } = require('./utils/grid');

const providersConfig = require('./rust.servers.config');

const discordBot = new Bot();

(async (args) => {
  const serverProvider = args[2] || process.env.SERVER_PROVIDER;
  const serverType = args[3] || process.env.SERVER_TYPE;

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
      rustplus.sendTeamMessage('Bot is now active');
      rustplus.sendTeamMessage(`Available commands: ${_.join(availableCommands, ', ')}`);
      rustplus.pvpToExclude = {};
      setInterval((rustplus) => rustplus.getTeamInfo((data) => {
        const team = data.response.teamInfo.members;
        _.forEach(team, dataSet => {
          if (!rustplus.nameSteamIdMap) {
            rustplus.nameSteamIdMap = {};
          }
          _.set(rustplus.nameSteamIdMap, dataSet.name, dataSet.steamId.toString());
          if (!dataSet.isAlive && ((Date.now() / 1000) - dataSet.deathTime) <= 1) {
            const gridData = getGridData(dataSet.x, dataSet.y, serverConfig.size);
            rustplus.sendTeamMessage(`ALERT | ${dataSet.name} just died at ${gridData.playerGrid} (${gridData.yDirection} ${gridData.xDirection})`);
          }
        });
      }), 1000, rustplus);
    });

    rustplus.on('message', async (message) => {
      const teamMessage = message.broadcast?.teamMessage?.message?.message;
      const playerName = message.broadcast?.teamMessage?.message?.name;
      const steamId = message.broadcast?.teamMessage?.message?.steamId?.toString();
      if (!teamMessage) return;
      // if (!_.includes(['76561199059928635', '76561198340609537'], steamId)) return;
      const realCommand = teamMessage.split(' ')[0].replace('!', '');
      if (!_.includes(availableCommands, realCommand)) return;
      return require(`./commands/${realCommand}`).execute({ rustbot: rustplus, serverConfig, replyInGame: true, args: teamMessage.split(' ').splice(1), steamId, playerName, serverType });
    });

    rustplus.connect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})(process.argv);
