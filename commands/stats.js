const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Shows player\'s stats'),
  execute: async ({ rustbot, interaction, serverConfig, serverType, steamId, playerName, args }) => {
    try {
      const fetchInfoFrom = _.size(args) > 0 ? rustbot.nameSteamIdMap[`${args.join(' ')}`] : steamId;
      const data = await require('../providers/rustoria').getMemberStatistics({ steamId: fetchInfoFrom, serverType });
      const pvpStats = {
        playerKills: data.pvp.data.pvp_player_kills_total,
        playerDeaths: data.pvp.data.pvp_player_deaths_total + data.pvp.data.pvp_player_deaths_suicides,
        playerHeadshots: data.pvp.data.pvp_player_headshot,
        bulletsHit: data.pvp.data.weapon_bullet_hit_player,
        bulletsTotal: data.pvp.data.weapon_bullet_fired_total
      };

      const resourcesStats = {
        stone: data.resources.data.farming_resource_stone_harvested,
        sulfur: data.resources.data.farming_resource_sulfur_harvested,
        wood: data.resources.data.farming_resource_wood_harvested,
        metal: data.resources.data.farming_resource_metal_harvested,
        hqm: data.resources.data.farming_resource_hqm_harvested
      };

      let responseName;
      _.map(rustbot.nameSteamIdMap, (val, key) => {
        if (val === fetchInfoFrom) {
          responseName = key;
        }
      });

      rustbot.sendTeamMessage(`>> ${responseName} Stats:`);
      rustbot.sendTeamMessage(`:rifle.ak:: ${pvpStats.playerKills} | :skull:: ${pvpStats.playerDeaths} | KD: ${(pvpStats.playerKills / pvpStats.playerDeaths).toFixed(2)}`);
      rustbot.sendTeamMessage(`:peperifle:: ${Math.floor((pvpStats.bulletsHit / pvpStats.bulletsTotal)) * 100}% | :rustheadbash:: ${(Math.floor(pvpStats.playerHeadshots / pvpStats.bulletsTotal)) * 100}%`);

      rustbot.sendTeamMessage(`:wood:: ${resourcesStats.wood} | :stones:: ${resourcesStats.stone} | :sulfur::${resourcesStats.sulfur} | :metal.fragments:: ${resourcesStats.metal} | :hq.metal.ore:: ${resourcesStats.hqm} `);
    } catch (e) {
      rustbot.sendTeamMessage('Player needs to unprivate their statistics on >> https://rustoria.co/');
      console.log(e);
    }
  }
};
