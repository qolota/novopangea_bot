import _ from 'lodash';
import fetchAtomichub from '../utils/fetchAtomichub';
import API_ENDPOINTS from '../consts/API_ENGPOINTS';

const ASSETS_LIMIT = 100;

const fetchAssets = async ({
    params,
    customProcessor = () => {},
}) => {
  let page = 1;
  let assets = [];

  while (true) {
    const data = await fetchAtomichub({
        type: API_ENDPOINTS.ASSETS,
        params: {
            limit: ASSETS_LIMIT,
            order: 'desc',
            sort: 'created',
            page,
            ...params,
        },
    });

    const pageAssets = _(data.data)
        .map((asset) => {

            return {
                id: asset.asset_id,
                mintId: Number(asset.template_mint),
                owner: asset.owner,
                schemaName: asset.schema.schema_name,
                collectionName: asset.collection.collection_name,
                templateId: asset.template.template_id,
                isBurned: asset.burned_at_time != null,
                name: asset.name,
                ...customProcessor({
                    asset,
                }),
            };
        })
        .value();

    assets = [
        ...assets,
        ...pageAssets,
    ];
    if (pageAssets.length < ASSETS_LIMIT) {
        break;
    }
    page++;
  }

  return assets;
};

export default fetchAssets;