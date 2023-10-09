const fetchWithAttempts = require('../utils/fetchWithAttempts');
const {WAX_BLOCKS_PROVIDER} = require('../configs/ENDPOINTS');

const fetchWaxData2 = async ({
  params,
  ignoreHttpErrorStatuses,
}) => {
    const data = await fetchWithAttempts({
      url: `${WAX_BLOCKS_PROVIDER}/v1/chain/get_table_rows`,
      options: {
        headers: {
          "accept": "*/*",
        },
        body: JSON.stringify(params),
        method: 'POST',
      },
      retries: 3,
      ignoreHttpErrorStatuses,
    });

    if (data == null) {
      return null;
    }

    if (data.code === 'ignore_http_status') {
      return data;
    }

    return {
        nextKey: data.next_key === ''
          ? null
          : data.next_key,
        rows: data.rows,
    };
}

module.exports = fetchWaxData2;
