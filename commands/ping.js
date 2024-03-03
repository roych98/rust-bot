const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!'),
  execute: async ({ rustbot, interaction }) => {
    await interaction.reply('Pong!');
    rustbot.sendTeamMessage('test');
  }
};
