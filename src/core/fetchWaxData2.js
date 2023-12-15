import fetchWithAttempts from '../utils/fetchWithAttempts';
import {WAX_BLOCKS_PROVIDER} from '../configs/ENDPOINTS';

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

export default fetchWaxData2;
