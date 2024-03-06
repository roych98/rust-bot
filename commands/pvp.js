const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');
const { getGridData } = require('../utils/grid');

const refreshPvpData = ({ rustbot, serverConfig }) => rustbot.getTeamInfo((data) => {
  const info = _.reduce(data?.response.teamInfo.members, (acc, member) => {
    const name = member.name;
    const x = member.x;
    const y = member.y;
    const isAlive = member.isAlive;
    const deadTimestamp = member.deathTime;

    const { playerGrid, xDirection, yDirection } = getGridData(x, y, serverConfig.size);

    acc.push({ name, playerGrid, isAlive, deadSince: ((Date.now() / 1000) - deadTimestamp), direction: `${yDirection} ${xDirection}` });
    return acc;
  }, []);
  _.forEach(info, member => {
    rustbot.sendTeamMessage(`${member.name} | Grid: ${member.playerGrid} (${member.direction}) | ${member.isAlive ? 'Alive' : 'Dead'} ${!member.isAlive ? ` | Died: ${Math.floor(member.deadSince)} seconds ago` : ''}`);
  });
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pvp')
    .setDescription('Stream pvp data live in-game'),
  execute: async ({ rustbot, interaction, serverConfig, replyInGame }) => {
    if (rustbot.pvpInterval) {
      clearInterval(rustbot.pvpInterval);
      rustbot.pvpInterval = undefined;
      return;
    }

    rustbot.pvpInterval = setInterval(() => {
      refreshPvpData({ rustbot, serverConfig });
    }, 10000);
  }
};
