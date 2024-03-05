const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raid')
    .setDescription('Alert everyone about an ongoing raid'),
  execute: async ({ rustbot, interaction, serverConfig, replyInGame }) => {
    if (interaction) {
      await interaction.reply('@everyone RAID ALERT!');
      await interaction.followUp('@everyone RAID ALERT!');
      await interaction.followUp('@everyone RAID ALERT!');
      await interaction.followUp('@everyone RAID ALERT!');
      await interaction.followUp('@everyone RAID ALERT!');
    }
    rustbot.sendTeamMessage('We are getting raided!');
    rustbot.sendTeamMessage('We are getting raided!');
    rustbot.sendTeamMessage('We are getting raided!');
    rustbot.sendTeamMessage('We are getting raided!');
    rustbot.sendTeamMessage('We are getting raided!');
  }
};
