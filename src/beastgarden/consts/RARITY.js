const _ = require('lodash');

export let RARITY = _([
  { name: 'common', weight: 1, index: 1.0, priceAlpha: 130, ROIDays: 18 },
  { name: 'uncommon', weight: 3, index: 1.2, priceAlpha: 400, ROIDays: 30 },
  { name: 'rare', weight: 5, index: 1.4, priceAlpha: 1000, ROIDays: 60 },
  { name: 'epic', weight: 7, index: 1.8, priceAlpha: 3000, ROIDays: 130 },
  {
    name: 'legendary',
    weight: 10,
    index: 2.5,
    priceAlpha: 11000,
    ROIDays: 365,
  },
])
  .map((rarity) => ({
    ...rarity,
    minBattleROIAlphaPayout: (rarity.priceAlpha / (rarity.ROIDays * 24)) * 10,
  }))
  .value();
RARITY = _(RARITY)
  .map((rarity) => ({
    ...rarity,
    payoutWeight:
      rarity.minBattleROIAlphaPayout / RARITY[0].minBattleROIAlphaPayout,
  }))
  .value();

export const getRarityWeight = (rarity) => {
  const obj = RARITY.find((r) => r.name === rarity);
  if (obj == null) {
    return null;
  }

  return obj.weight;
};

export const getRarityIndex = (rarity) => {
  const obj = RARITY.find((r) => r.name === rarity);
  if (obj == null) {
    return null;
  }

  return obj.index;
};

export const getMinBattleROIAlphaPayout = (rarity) => {
  const obj = RARITY.find((r) => r.name === rarity);
  if (obj == null) {
    return null;
  }

  return obj.minBattleROIAlphaPayout;
};

export const getPayoutWeight = (rarity) => {
  const obj = RARITY.find((r) => r.name === rarity);
  if (obj == null) {
    return null;
  }

  return obj.payoutWeight;
};
