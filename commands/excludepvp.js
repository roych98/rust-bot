const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('excludepvp')
    .setDescription('Exclude specific players from being shown in PVP messages'),
  execute: async ({ rustbot, interaction, serverConfig, playerName, args }) => {
    if (_.size(args) === 0) {
      if (_.get(rustbot.pvpToExclude, playerName)) {
        _.set(rustbot, 'pvpToExclude', { [`${playerName}`]: false });
        rustbot.sendTeamMessage(`Including ${playerName} in PVP messages again`);
      } else {
        _.set(rustbot, 'pvpToExclude', { [`${playerName}`]: true });
        rustbot.sendTeamMessage(`Excluded ${playerName} from being shown in PVP messages`);
      }
    } else if (_.get(rustbot.pvpToExclude, args[0])) {
      _.set(rustbot, 'pvpToExclude', { [`${args[0]}`]: false });
      rustbot.sendTeamMessage(`Including ${args[0]} in PVP messages again`);
    } else {
      _.set(rustbot, 'pvpToExclude', { [`${args[0]}`]: true });
      rustbot.sendTeamMessage(`Excluded ${args[0]} from being shown in PVP messages`);
    }
  }
};
