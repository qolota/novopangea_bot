import _ from 'lodash';
import CONTRACTS from '../consts/CONTRACTS';
import fetchAllWaxData from '../../core/fetchAllWaxData';

const convertPool = (pool) => {
    const [quantity, symbol] = pool.quantity.split(' ');

    return {
        quantity: Number(quantity),
        symbol,
        contract: pool.contract,
        fullTokenName: `${symbol}+${pool.contract}`,
    };
};

const groupPools = (pools, index) => _(pools)
    .groupBy(pool => `${pool.symbols[index].symbol}+${pool.symbols[index].contract}`)
    .value();

const fetchSwapPools = async () => {
    const pools = await fetchAllWaxData({
      params: {
          code: CONTRACTS.SWAP2,
          scope: CONTRACTS.SWAP2,
          table: "pools",
      },
      customProcessor: async ({row}) => {
          const pool = {
              id: row.id,
              fee: row.fee/100,
              symbols: [
                  convertPool(row.tokenA),
                  convertPool(row.tokenB),
              ],
          };
  
          pool.symbols = [
              {
                  ...pool.symbols[0],
                  price: pool.symbols[1].quantity/pool.symbols[0].quantity,
              },
              {
                  ...pool.symbols[1],
                  price: pool.symbols[0].quantity/pool.symbols[1].quantity,
              },
          ];
  
          return pool;
      },
    });
  
    const groupedPools = _.mergeWith(
        groupPools(pools, 0),
        groupPools(pools, 1),
        (objValue, srcValue) => {
          if (_.isArray(objValue)) {
            return objValue.concat(srcValue);
          }
        }
      );
  
    return groupedPools;
  };

export default fetchSwapPools;
