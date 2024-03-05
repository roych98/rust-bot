const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');

function findXGrid (mapSize, gridSize, currentPosition) {
  return Math.floor(currentPosition / gridSize);
}

function findYGrid (mapSize, gridSize, currentPosition) {
  return Math.ceil(currentPosition / gridSize);
}

const refreshPvpData = ({ rustbot, serverConfig }) => rustbot.getTeamInfo((data) => {
  const gridSize = 146.3;
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

      const xMap = {};
      const yMap = {};
      for (let i = 0; i < gridWidth; i++) {
        let letter = String.fromCharCode(i >= 26 ? 65 - 26 + i : 65 + i);
        if (i >= 26) {
          letter = `A${letter}`;
        }
        xMap[i] = `${letter}`;
      }

      for (let i = gridHeight - 1; i >= 0; i--) {
        yMap[`${gridHeight - 1 - i}`] = i;
      }

      const relativeX = findXGrid(mapSize, gridSize, playerX);

      const relativeY = findYGrid(mapSize, gridSize, playerY);

      return `${xMap[relativeX]}${yMap[relativeY]}`;
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
    }, 5000);
  }
};
