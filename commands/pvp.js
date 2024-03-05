const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');

const refreshPvpData = ({ rustbot, serverConfig }) => rustbot.getTeamInfo((data) => {
  const gridSize = 150;
  const mapSize = serverConfig.size;

  const info = _.reduce(data?.response.teamInfo.members, (acc, member) => {
    const name = member.name;
    const x = member.x;
    const y = member.y;
    const isAlive = member.isAlive;
    const deadTimestamp = member.deathTime;

    function calculateGrid (mapSize, gridSize, playerX, playerY) {
      const gridWidth = Math.ceil(mapSize / gridSize);
      const gridHeight = Math.ceil(mapSize / gridSize);

      const row = Math.floor(playerY / gridSize);
      const col = Math.floor(playerX / gridSize);

      const colIdx1 = Math.floor(col / 26);
      const colIdx2 = col % 26;

      let letter = '';
      if (colIdx1 > 0) {
        letter += String.fromCharCode(65 + colIdx1 - 1);
      }
      letter += String.fromCharCode(65 + colIdx2);

      const number = gridHeight - row - 1;

      return `${letter}${number}`;
    }

    const playerGrid = calculateGrid(mapSize, gridSize, x, y);
    console.log(x, y);
    acc.push({ name, playerGrid, isAlive, deadSince: (Date.now() - deadTimestamp) / 1000 });
    return acc;
  }, []);
  _.forEach(info, member => {
    rustbot.sendTeamMessage(`${member.name} | Grid: ${member.playerGrid} | Is Alive: ${member.isAlive} ${!member.isAlive ? ` | Dead since: ${member.deadSince}` : ''}`);
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
