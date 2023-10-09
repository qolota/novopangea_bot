const _ = require('lodash');
const fetchAllWaxData = require('../../core/fetchAllWaxData');
const CONTRACTS = require('../consts/CONTRACTS');

const convertDex = (dex, min) => {
    const [precision, symbol] = dex.sym.split(',');
    const [minValue] = min.split(' ');

    return {
        precision: Number(precision),
        symbol,
        contract: dex.contract,
        fullTokenName: `${symbol}+${dex.contract}`,
        min: Number(minValue),
    };
};

const groupDexs = (dexs, index) => _(dexs)
    .groupBy(dex => `${dex.symbols[index].symbol}+${dex.symbols[index].contract}`)
    .value();

const fetchDEXs = async () => {
  const dexs = await fetchAllWaxData({
    params: {
        code: CONTRACTS.DEX,
        scope: CONTRACTS.DEX,
        table: "markets",
    },
    customProcessor: async ({row}) => {
        const dex = {
          id: row.id,
          fee: row.fee/100/100,
          isFrozen: row.frozen,
          symbols: [
              convertDex(row.base_token, row.min_buy),
              convertDex(row.quote_token, row.min_sell),
          ],
        };

        return dex;
    },
  });

  const groupedDexs = _.mergeWith(
      groupDexs(dexs, 0),
      groupDexs(dexs, 1),
      (objValue, srcValue) => {
        if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
        }
      }
    );

   return groupedDexs;
};

module.exports = fetchDEXs;
