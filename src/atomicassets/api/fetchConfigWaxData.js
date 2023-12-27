import _ from 'lodash';
import CONTRACTS from '../consts/CONTRACTS';
import fetchAllWaxData2 from '../../core/fetchAllWaxData2';

const fetchConfigWaxData = async () => {
    const configs = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.ATOMIC_ASSETS,
            scope: CONTRACTS.ATOMIC_ASSETS,
            table: 'config',
        },
        customProcessor: ({row}) => {
            return {
                assetCounter: row.asset_counter,
                templateCounter: row.template_counter,
                offerCounter: row.offer_counter,
                collectionSchema: row.collection_format,
                suportedTokens: row.supported_tokens,
            };
        },
    });

    return configs[0];
};

export default fetchConfigWaxData;