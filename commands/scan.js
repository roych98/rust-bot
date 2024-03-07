const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');
const { idToName, nameToId } = require('../utils/rustItemMappers');
const { getGridData } = require('../utils/grid');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scan')
    .setDescription('Scan shops for specific items'),
  execute: ({ rustbot, interaction, serverConfig, args }) => {
    if (_.size(args) > 1) {
      return;
    }
    const itemToFind = args[0];
    if (!_.get(nameToId, itemToFind)) {
      rustbot.sendTeamMessage(`Item ${itemToFind} does not exist. Please refer to discord to find the correct item name`);
      return;
    }
    rustbot.getMapMarkers(data => {
      const reducedResults = _.reduce(data?.response?.mapMarkers?.markers, (acc, appMarker) => {
        if (appMarker.type === 3 && !appMarker.outOfStock) {
          _.map(appMarker.sellOrders, sellOrder => {
            if (nameToId[itemToFind] === sellOrder.itemId && sellOrder.amountInStock > 0) {
              acc.push({ grid: getGridData(appMarker.x, appMarker.y, serverConfig.size), amount: sellOrder.amountInStock, require: idToName[sellOrder.currencyId], quantityNeededToBuy: sellOrder.costPerItem, howMuchYouGet: sellOrder.quantity, name: appMarker.name });
            }
          });
        }
        return acc;
      }, []);
      rustbot.sendTeamMessage(`Shops that sell ${itemToFind}:`);
      _.forEach(reducedResults, result => {
        const grid = result.grid.playerGrid;
        const xDirection = result.grid.xDirection;
        const yDirection = result.grid.yDirection;
        const amountAvailable = result.amount;
        const needToBuy = result.require;
        const quantityNeededToBuy = result.quantityNeededToBuy;
        const howMuchYouGet = result.howMuchYouGet;

        rustbot.sendTeamMessage(`Grid: ${grid} (${yDirection} ${xDirection}) | Amount: ${amountAvailable} | Needed: ${needToBuy} | How much to buy: ${quantityNeededToBuy} | You get: ${howMuchYouGet}`);
      });
    });
  }
};
