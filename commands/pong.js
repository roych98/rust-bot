const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pong')
    .setDescription('Replies with ping!'),
  execute: async ({ rustbot, interaction }) => {
    await interaction.reply('Ping!');
  }
};
