import fetchAllWaxData2 from '../../core/fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';

const fetchExchange = async () => {
    const exchange = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.EXCHANGE,
            scope: CONTRACTS.EXCHANGE,
            table: "exchange",
        },
        customProcessor: ({row}) => ({
            id: row.id,
            from: row.from,
            to: row.to,
            rate: Number(row.rate),
            min: Number(row.min),
        }),
    });

    return exchange;
};

export default fetchExchange;