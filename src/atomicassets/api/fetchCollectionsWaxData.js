import _ from 'lodash';
import CONTRACTS from '../consts/CONTRACTS';
import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import fetchConfigWaxData from './fetchConfigWaxData';
import deserializeData from '../utils/deserializeData';
import fetchCollectionSchemasWaxData from './fetchCollectionSchemasWaxData';
import fetchCollectionTemplatesWaxData from './fetchCollectionTemplatesWaxData';

const fetchCollectionsWaxData  = async ({
    collectionName,
}) => {
    const config = await fetchConfigWaxData();
    const collections = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.ATOMIC_ASSETS,
            scope: CONTRACTS.ATOMIC_ASSETS,
            table: 'collections',
            lower_bound: collectionName,
            upper_bound: collectionName,
        },
        customProcessor: ({row}) => {
            return {
                collectionName: row.collection_name,
                author: row.author,
                allowNotify: row.allow_notify === 1,
                authorizedAccounts: row.authorized_accounts,
                notifyAccounts: row.notify_accounts,
                marketFee: Number(row.market_fee),
                data: deserializeData({
                    schema: config.collectionSchema,
                    serializedData: row.serialized_data,
                }),
            };
        },
    });

    for (let i = 0; i < collections.length; i++) {
        collections[i].schemas = await fetchCollectionSchemasWaxData({
            collectionName: collections[i].collectionName,
        });
        collections[i].templates = await fetchCollectionTemplatesWaxData({
            collectionName: collections[i].collectionName,
            cache: {
                schemas: collections[i].schemas,
            },
        });
    }
    
    return collections;
};

export default fetchCollectionsWaxData;