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
        rustbot.sendTeamMessage(`Including [${playerName}] in PVP messages again`);
      } else {
        _.set(rustbot, 'pvpToExclude', { [`${playerName}`]: true });
        rustbot.sendTeamMessage(`Excluded [${playerName}] from being shown in PVP messages`);
      }
    } else {
      const targetName = _.join(args, ' ');
      if (_.get(rustbot.pvpToExclude, targetName)) {
        _.set(rustbot, 'pvpToExclude', { [`${targetName}`]: false });
        rustbot.sendTeamMessage(`Including [${targetName}] in PVP messages again`);
      } else {
        _.set(rustbot, 'pvpToExclude', { [`${targetName}`]: true });
        rustbot.sendTeamMessage(`Excluded [${targetName}] from being shown in PVP messages`);
      }
    }
  }
};
