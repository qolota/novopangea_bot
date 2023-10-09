const CONTRACTS = require('../consts/CONTRACTS');

const voteProducer = ({
    accountName,
    proxyName,
}) => {
  return {
    account: CONTRACTS.WAX,
    name: 'voteproducer',
    authorization: [
      {
        actor: accountName,
        permission: 'active',
      },
    ],
    data: {
      proxy: proxyName,
      producers: [],
      voter: accountName,
    },
  };
};

module.exports = voteProducer;
