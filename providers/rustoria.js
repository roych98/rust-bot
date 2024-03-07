const axios = require('axios');

const BASE_URI = 'https://api.rustoria.co';
const endpoint = (steamId, serverType) => `/statistics/users/${steamId.toString()}/${serverType}`;

const getMemberStatistics = async ({ steamId, serverType }) => {
  console.log(serverType);

  const stringifiedEndpoint = endpoint(steamId, serverType);
  const memberStatistics = await axios.get(`${BASE_URI}${stringifiedEndpoint}`);

  return memberStatistics?.data;
};

module.exports = {
  getMemberStatistics
};
