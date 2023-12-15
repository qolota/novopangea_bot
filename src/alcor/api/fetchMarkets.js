import _ from 'lodash';
import fetchDEXs from './fetchDEXs';
import fetchSwapPools from './fetchSwapPools';

const fetchMarkets = async () => {
  const dexs = await fetchDEXs();
  const pools = await fetchSwapPools();

  const markets = _([
    ..._.keys(dexs),
    ..._.keys(pools),
  ])
    .uniq()
    .map(marketKey => ({
      marketKey,
      dexs: dexs[marketKey] || [],
      pools: pools[marketKey] || [],
    }))
    .reduce((markets, market) => {
      markets[market.marketKey] = market;
      return markets;
    }, {});

  return markets;
};

export default fetchMarkets;
