const CONTRACTS = require('../consts/CONTRACTS');

const claimWax = ({
    accountName,
}) => {
  return {
    account: CONTRACTS.WAX,
    name: 'claimgbmvote',
    authorization: [
      {
        actor: accountName,
        permission: 'active',
      },
    ],
    data: {
      owner: accountName,
    },
  };
};

module.exports = claimWax;
