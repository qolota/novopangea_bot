import fetchWithAttempts from '../utils/fetchWithAttempts';
import {WAX_BLOCKS_PROVIDER} from '../configs/ENDPOINTS';

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

export default fetchWaxData;
