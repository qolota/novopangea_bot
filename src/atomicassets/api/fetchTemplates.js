import _ from 'lodash';
import fetchAtomichub from '../utils/fetchAtomichub';
import API_ENDPOINTS from '../consts/API_ENGPOINTS';

const TEMPLATE_LIMIT = 100;

const fetchTemplates = async ({
    params,
    customProcessor = () => {},
}) => {
    let page = 1;
  let assets = [];

  while (true) {
    const data = await fetchAtomichub({
        type: API_ENDPOINTS.TEMPLATES,
        params: {
            limit: TEMPLATE_LIMIT,
            order: 'desc',
            sort: 'created',
            page,
            ...params,
        },
    });

    const pageTemplates = _(data.data)
        .map((template) => {
            return {
                id: template.template_id,
                collectionName: template.collection.collection_name,
                schemaName: template.schema.schema_name,
                name: template.name,
                issuedSupply: Number(template.issued_supply),
                maxSupply: Number(template.max_supply),
                ...customProcessor({
                    template,
                }),
            };
        })
        .value();

        assets = [
            ...assets,
            ...pageTemplates,
        ];
        if (pageTemplates.length < TEMPLATE_LIMIT) {
            break;
        }
        page++;
  }

  return assets;
};

export default fetchTemplates;