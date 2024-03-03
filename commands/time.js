const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('time')
    .setDescription('Get the current server-time, and when night or day time is about to end.'),
  execute: async ({ rustbot, interaction, serverConfig }) => {
    await rustbot.getTime(async response => {
      // time, sunrise, sunset, scale(?)
      const time = response.response.time;

      // Constants
      const daytimeStart = time.sunrise || 7;
      const nighttimeStart = time.sunset || 17;

      const daytimeDuration = serverConfig.day || 45; // Daytime is 45 minutes
      const nighttimeDuration = serverConfig.night || 15; // Nighttime is 15 minutes

      const currentHour = Math.floor(time.time);
      const currentMinute = Math.floor((time.time % 1) * 60);

      const calculateRemainingTime = currentGameTime => {
        let eventType;
        let remainingTimeInSeconds;

        if (currentGameTime < daytimeStart) {
          // Between nighttime and daytime
          const remainingNighttime = daytimeStart - currentGameTime;
          eventType = 'Day';
          remainingTimeInSeconds = Math.round(remainingNighttime * nighttimeDuration / (daytimeStart - nighttimeStart)) * 60; // Convert minutes to seconds
        } else if (currentGameTime >= daytimeStart && currentGameTime < nighttimeStart) {
          // Between daytime and nighttime
          const remainingDaytime = nighttimeStart - currentGameTime;
          eventType = 'Night';
          remainingTimeInSeconds = Math.round(remainingDaytime * daytimeDuration / (nighttimeStart - daytimeStart)) * 60; // Convert minutes to seconds
        } else {
          // Between nighttime and the end of the day
          const remainingNighttime = 24 + daytimeStart - currentGameTime;
          eventType = 'Night';
          remainingTimeInSeconds = Math.round(remainingNighttime * nighttimeDuration / (daytimeStart + (24 - nighttimeStart))) * 60; // Convert minutes to seconds
        }

        // Convert total remaining seconds to minutes and seconds
        const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
        const remainingSeconds = remainingTimeInSeconds % 60;

        return { eventType, remainingMinutes, remainingSeconds };
      };

      const { eventType, remainingMinutes, remainingSeconds } = calculateRemainingTime(time.time);

      rustbot.sendTeamMessage(`Current Time: ${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute} (in-game time)`);
      rustbot.sendTeamMessage(`Next ${eventType}: ${remainingMinutes} minutes and ${remainingSeconds} seconds (IRL)`);

      await interaction.reply(`Current Time: ${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute} (in-game time)`);
      await interaction.followUp(`Next ${eventType}: ${remainingMinutes} minutes and ${remainingSeconds} seconds (IRL)`);
    });
  }
};
