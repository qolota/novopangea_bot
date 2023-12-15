import _ from 'lodash';
import fetchWaxData2 from './fetchWaxData2';

const DEFAULT_LIMIT = 1000;

const fetchAllWaxData2 = async ({
    params,
    customProcessor = async ({row}) => row,
    ignoreHttpErrorStatuses = [],
    customLowerBoundProcessor = ({lowerBound}) => lowerBound,
}) => {
    let lowerBound = params.lower_bound || null;
    let rows = [];

    while (true) {
        console.log(`Loading wax data ${params.code}:${params.table} from ${lowerBound} +${DEFAULT_LIMIT}`);
        const data = await fetchWaxData2({
            params: {
                limit: DEFAULT_LIMIT,
                lower_bound: lowerBound,
                upper_bound: null,
                show_payer: false,
                reverse: false,
                json: true,
                key_type: "",
                index_position: 1,
                ..._.omit(params, [
                    'limit',
                    'lower_bound',
                    'show_payer',
                    'reverse',
                    'json',
                    'key_type',
                    'index_position',
                ]),
            },
            ignoreHttpErrorStatuses,
        });

        if (data.code === 'ignore_http_status') {
            lowerBound = customLowerBoundProcessor({
                lowerBound,
            });
            continue;
        }

        const {
            nextKey,
            rows: nextRows,
        } = data;

        if (nextRows.length === 0) {
            return rows;
        }
        const processedNextRows = [];

        for (let rowIndex = 0; rowIndex < nextRows.length; rowIndex++) {
            const nextRow = nextRows[rowIndex];
            const processedNextRow = await customProcessor({row: nextRow});
            processedNextRows.push(processedNextRow);
        }
        
        rows = [
            ...rows,
            ...processedNextRows,
        ];

        if (nextKey == null) {
            return rows;
        }

        lowerBound = nextKey;
    }
};

export default fetchAllWaxData2;



