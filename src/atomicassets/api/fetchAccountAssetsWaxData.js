import _ from 'lodash';
import CONTRACTS from '../consts/CONTRACTS';
import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import fetchCollectionsWaxData from './fetchCollectionsWaxData';
import deserializeData from '../utils/deserializeData';
import CORE_ATOMICHUB_PARAMS  from '../consts/CORE_ATOMICHUB_PARAMS';
import firstMintAssetIds from '../data/mint-1-asset-ids-1686139302999.json';

const getCollectionNames = ({
    assets,
    params,
}) => {
    const coreParams = _.pick(params, CORE_ATOMICHUB_PARAMS);

    return _(assets)
        .filter(asset => _.isMatch(asset.params, coreParams))
        .map(asset => asset.collectionName)
        .uniq()
        .value();
};

const fetchAccountAssetsWaxData = async ({
    accountName,
    assetParams = [],
}) => {
    let assets = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.ATOMIC_ASSETS,
            scope: accountName,
            table: 'assets',
        },
        customProcessor: ({row}) => {
            return {
                id: row.asset_id,
                collectionName: row.collection_name,
                schemaName: row.schema_name,
                templateId: row.template_id,
                ramPayer: row.ram_payer,
                backedTokens: _(row.backed_tokens)
                    .map(row => {
                        const [
                            value,
                            symbol,
                        ] = row.split(' ');

                        return {
                            value: Number(value),
                            symbol,
                        };
                    })
                    .value(),
                immutableSerializedData: row.immutable_serialized_data,
                mutableSerializedData: row.mutable_serialized_data,
                params: {
                    collectionName: row.collection_name,
                    schemaName: row.schema_name,
                    templateId: row.template_id,
                },
            };
        },
    });
        
    const collectionNames = _(assetParams)
        .map(assetParams => getCollectionNames({
            assets,
            params: assetParams.params,
        }))
        .flatten()
        .uniq()
        .value();

    let collections = [];

    for (let i = 0; i < collectionNames.length; i++) {
        const nextCollections = await fetchCollectionsWaxData({
            collectionName: collectionNames[i],
        });
        collections = [
            ...collections,
            ...nextCollections,
        ];
    }

    const assetGroups = _(assetParams)
        .map(assetParams => {
            const coreParams = _.pick(assetParams.params, CORE_ATOMICHUB_PARAMS);
            const otherParams = _.omit(assetParams.params, CORE_ATOMICHUB_PARAMS);
            const customProcessor = assetParams.customProcessor || (() => {});

            const _assets = _(assets)
                .filter(asset => _.isMatch(asset.params, coreParams))
                .map(asset => {
                    const collection = collections
                        .find(collection => collection.collectionName === asset.collectionName);
                    const template = collection.templates
                        .find(template => template.id === asset.templateId);
                    const schema = collection.schemas
                        .find(schema => schema.schemaName === asset.schemaName);
                    const templateImmutableData = deserializeData({
                        schema: schema.templateSchema,
                        serializedData: asset.immutableSerializedData,
                    });
                    const assetImmutableData = template.immutableData;
                    const assetMutableData = deserializeData({
                        schema: schema.templateSchema,
                        serializedData: asset.mutableSerializedData,
                    });
        
                    return {
                        ..._.omit(asset, [
                            'immutableSerializedData',
                            'mutableSerializedData',
                        ]),
                        template,
                        schema,
                        collection: _.omit(collection, [
                            'templates',
                            'schemas',
                        ]),
                        templateImmutableData,
                        assetImmutableData,
                        assetMutableData,
                        params: {
                            ...templateImmutableData,
                            ...assetImmutableData,
                            ...assetMutableData,
                            ...asset.params,
                        },
                    };
                })
                .filter(asset => _.isMatch(asset.params, otherParams))
                .map((asset) => {
                    return {
                        id: asset.id,
                        mintId: firstMintAssetIds.includes(asset.id)
                            ? 1
                            : null,
                        owner: accountName,
                        collectionName: asset.collectionName,
                        schemaName: asset.schemaName,
                        templateId: asset.templateId,
                        isBurned: false,
                        name: asset.template.immutableData.name,
                        ...customProcessor({
                            asset,
                        }),
                    };
                })
                .value();

            return {
                key: assetParams.key,
                assets: _assets,
                params: assetParams.params,
            };
        })
        .reduce((assetGroups, assetGroup) => {
            assetGroups[assetGroup.key] = assetGroup.assets;

            return assetGroups;
        }, {});
    
    return assetGroups;
};

export default fetchAccountAssetsWaxData;
