const { Client, Collection, GatewayIntentBits, Partials, REST, Routes, Events } = require('discord.js');
const _ = require('lodash');

const TIMEOUT_SECONDS = 5000;

module.exports = class Bot {
  _isBotOnline = false;
  _commands;
  _rustCommands;
  _rustCommandsMap = {};
  _rustbot;

  constructor () {
    this._token = process.env.DISCORD_BOT_TOKEN;
  }

  getInstance = async () => {
    if (this._discordClient) return this.discordClient;
    return this.init();
  };

  loadRustCommands () {
    const allCommands = {};
    for (const rustCommand in this._rustCommands) {
      allCommands[`${rustCommand}`] = require(`../../commands/${rustCommand}`).execute;
    }
    return allCommands;
  }

  init = async ({ rustCommands, rustbot, serverConfig }) => {
    if (this._discordClient) return this._discordClient;
    this._rustCommands = rustCommands;
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

      this._rustbot = rustbot;
      this._discordClient.commands = new Collection();

      await this._discordClient.login(this._token);

      this._discordClient.on('ready', async () => {
        const commands = [];
        console.log('Discord bot is now listening...');
        _.forEach(this._rustCommands, command => {
          const commandData = require(`../../commands/${command}`);
          this._rustCommandsMap[`${command}`] = commandData.execute;
          commands.push(commandData.data.toJSON());
        });

        const rest = new REST().setToken(this._token);

        await rest.put(
          Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID),
          { body: commands }
        );

        this._discordClient.on(Events.InteractionCreate, async interaction => {
          if (!interaction.isChatInputCommand()) return;

          await this._rustCommandsMap[interaction.commandName]({ interaction, rustbot, serverConfig });
        });

        this._isBotOnline = true;
      });

      return new Promise(resolve => {
        setTimeout(() => {
          if (this._isBotOnline) {
            return resolve({ discordClient: this._discordClient });
          }
          throw new Error(`Discord did not initialize after ${TIMEOUT_SECONDS / 1000} seconds`);
        }, TIMEOUT_SECONDS);
      }).then(data => data);
    } catch (e) {
      console.log(e);
    }
  };
};
