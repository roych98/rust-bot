const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');
const { getGridData } = require('../utils/grid');

const refreshPvpData = ({ rustbot, serverConfig }) => rustbot.getTeamInfo((data) => {
  const onlinePlayers = data?.response.teamInfo.members.filter(member => member.isOnline);
  const info = _.reduce(onlinePlayers, (acc, member) => {
    const name = member.name;
    const x = member.x;
    const y = member.y;

    if (!rustbot?.teamData?.[`${name}`]) {
      _.set(rustbot, `teamData.${name}`, { x, y, intervalCount: 1, exclude: false });
    } else {
      const playerData = rustbot?.teamData[`${name}`];
      if (playerData.x === x && playerData.y === y) {
        if (playerData?.intervalCount === 3) {
          playerData.exclude = true;
        } else {
          playerData.intervalCount++;
        }
      } else {
        playerData.x = x;
        playerData.y = y;
        playerData.intervalCount = 0;
        playerData.exclude = false;
      }
    }

    // Players will be excluded from being reported if they're afk or manually excluded
    const shouldBeExcluded = _.get(rustbot?.teamData?.[`${name}`], 'exclude', false) || _.get(rustbot, `pvpToExclude.${name}`, false);
    if (shouldBeExcluded) return acc;

    const isAlive = member.isAlive;
    const deadTimestamp = member.deathTime;

    const { playerGrid, xDirection, yDirection } = getGridData(x, y, serverConfig.size);

    acc.push({ name, playerGrid, isAlive, deadSince: ((Date.now() / 1000) - deadTimestamp), direction: `${yDirection} ${xDirection}` });
    return acc;
  }, []);

  const sortedInfo = _.sortBy(info, user => user.playerGrid);
  const markers = ['!', '@', '#', '$', '%', '^', '*', '+', '-', '_'];

  /* const grids = _.reduce(sortedInfo, (acc, info) => {
    if (_.includes(acc, info.playerGrid)) return acc;
    _.set(acc, `${info.playerGrid}`, markers[_.size(acc)]);
    return acc;
  }, {}); */

  _.forEach(sortedInfo, (member, i) => {
    setTimeout(() => rustbot.sendTeamMessage(`${member.name} | Grid: ${member.playerGrid} (${member.direction})${member.isAlive ? ' | Alive' : ''} ${!member.isAlive ? ` | Died: ${Math.floor(member.deadSince)} seconds ago` : ''}`), 250 * i);
  });
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pvp')
    .setDescription('Stream pvp data live in-game'),
  execute: async ({ rustbot, interaction, serverConfig, replyInGame }) => {
    if (rustbot.pvpInterval) {
      clearInterval(rustbot.pvpInterval);
      rustbot.pvpToExclude = undefined;
      rustbot.pvpInterval = undefined;
      rustbot.teamData = undefined;
      return;
    }

    refreshPvpData({ rustbot, serverConfig });
    rustbot.pvpInterval = setInterval(() => {
      refreshPvpData({ rustbot, serverConfig });
    }, 30000);
  }
};
