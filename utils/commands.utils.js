const fs = require('fs').promises;
const path = require('path');

const commandsFolderPath = './commands';

const getAvailableCommands = async () => {
  try {
    const files = await fs.readdir(commandsFolderPath);

    return files.map(file => path.parse(file).name);
  } catch (err) {
    console.error('Error reading directory:', err);
  }
};

const executeCommand = async ({ executor, args }) => {
  const fnRes = await executor(...args);
  return fnRes;
};

module.exports = {
  getAvailableCommands,
  executeCommand
};
