import _ from 'lodash';
import CONTRACTS from '../consts/CONTRACTS';
import fetchAllWaxData2 from '../../core/fetchAllWaxData2';

const fetchCollectionSchemasWaxData = async ({
    collectionName,
}) => {
    const schemas = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.ATOMIC_ASSETS,
            scope: collectionName,
            table: 'schemas',
        },
        customProcessor: ({row}) => ({
            schemaName: row.schema_name,
            templateSchema: row.format,
        }),
    });
    
    return schemas;
};

export default fetchCollectionSchemasWaxData;