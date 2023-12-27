import _ from 'lodash';
import fetchAtomichub from '../utils/fetchAtomichub';
import API_ENDPOINTS from '../consts/API_ENGPOINTS';

const fetchTemplatesStats = async ({
    params,
    customProcessor = () => {},
}) => {
    const template = await fetchAtomichub({
        type: API_ENDPOINTS.TEMPLATES_STATS,
        params,
    });

    const templateStats = {
        burned: Number(template.data.burned),
        issuedSupply: Number(template.data.assets),
        ...customProcessor({
            template,
        }),
    };

    return templateStats;
};

export default fetchTemplatesStats;