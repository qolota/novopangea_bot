const fetchWithAttempts = require('../utils/fetchWithAttempts');
const {WAX_BLOCKS_PROVIDER} = require('../configs/ENDPOINTS');

const fetchWaxData = async (params) => {
    const data = await fetchWithAttempts({
      url: `${WAX_BLOCKS_PROVIDER}/v1/chain/get_table_rows`,
      options: {
        headers: {
          accept: '*/*',
        },
        body: JSON.stringify(params),
        method: 'POST',
      },
      retries: 3,
    });

    if (data.rows.length === 0) {
      return [];
    }

    return data.rows;
}

module.exports = fetchWaxData;
