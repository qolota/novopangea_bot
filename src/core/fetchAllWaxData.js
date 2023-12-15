import fetchWaxData from './fetchWaxData';

const DEFAULT_LIMIT = 1000;
const START_ID = 1;

const fetchAllWaxData = async ({
    params,
    customProcessor = async ({row}) => row,
}) => {
    if (params.limit === null) {
        throw new Error(`limit cannot be 'null'`);
    }

    const limit = params.limit || DEFAULT_LIMIT;
    let nextId = params.lower_bound || START_ID;
    let rows = [];

    while (true) {
        console.log(`Loading wax data ${params.code}:${params.table} from ${nextId} +${DEFAULT_LIMIT}`);
        const nextRows = await fetchWaxData({
            limit,
            lower_bound: nextId,
            upper_bound: null,
            show_payer: false,
            reverse: false,
            json: true,
            key_type: "",
            index_position: 1,
            ...params,
        });

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

        const lastRow = nextRows[nextRows.length - 1];
        nextId = lastRow.id + 1;
    }
};

export default fetchAllWaxData;
