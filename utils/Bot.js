const { Client, GatewayIntentBits, Partials, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

const TIMEOUT_SECONDS = 10000;

module.exports = class Bot {
  constructor () {
    this._token = process.env.DISCORD_BOT_TOKEN;
  }

  getInstance = async () => {
    if (this._discordClient) return this.discordClient;
    return this.init();
  };

  init = async () => {
    if (this._discordClient) return this._discordClient;
    try {
      this._discordClient = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.DirectMessages
        ],
        partials: [
          Partials.Channel
        ]
      });

      await this._discordClient.login(this._token);

      let isBotOnline;

      this._discordClient.on('ready', async () => {
        console.log('Discord bot is now listening...');
        isBotOnline = true;
      });

      return new Promise(resolve => {
        setTimeout(() => {
          if (isBotOnline) {
            resolve({ discordClient: this._discordClient });
          }
          throw new Error(`Discord did not initialize after ${TIMEOUT_SECONDS / 1000} seconds`);
        }, TIMEOUT_SECONDS);
      }).then(data => data);
    } catch (e) {
      console.log(e);
    }
  };
};
