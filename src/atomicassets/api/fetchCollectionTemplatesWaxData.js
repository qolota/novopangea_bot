import _ from 'lodash';
import CONTRACTS from '../consts/CONTRACTS';
import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import fetchCollectionSchemasWaxData from './fetchCollectionSchemasWaxData';
import deserializeData from '../utils/deserializeData';

const fetchCollectionTemplatesWaxData  = async ({
    collectionName,
    cache = {},
}) => {
    const schemas = cache.schemas || await fetchCollectionSchemasWaxData({
        collectionName,
    });
    const templates = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.ATOMIC_ASSETS,
            scope: collectionName,
            table: 'templates',
        },
        customProcessor: ({row}) => ({
            id: row.template_id,
            schemaName: row.schema_name,
            isTransferable: row.transferable === 1,
            isBurnable: row.burnable === 1,
            maxSupply: row.max_supply,
            issuedSupply: row.issued_supply,
            immutableData: deserializeData({
                schema: schemas
                    .find(schema => schema.schemaName === row.schema_name)
                    .templateSchema,
                serializedData: row.immutable_serialized_data,
            }),
        }),
    });
    
    return templates;
};

export default fetchCollectionTemplatesWaxData;