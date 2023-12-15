const fetchProxies = require('./api/fetchProxies');
const fetchVoter = require('./api/fetchVoter');
const claimWax = require('./actions/claimWax');
const voteProdcuer = require('./actions/voteProducer');

const claimWaxRewardCalcNextAction = async ({
    accountName,
}) => {
    const proxies = await fetchProxies();
    const voter = await fetchVoter({
        accountName,
    });
    if (voter.lastClaimTime.getTime() > (Date.now() - 24 * 60 * 60 * 1000)) {
        return {
            action: 'wait',
            message: 'Nothing to claim',
        }
    }

    return {
        action: 'claim_and_vote',
        actions: [
            voteProdcuer({
                accountName,
                proxyName: proxies[0].account,
            }),
            claimWax({
                accountName,
            }),
        ],
    };
};

export default claimWaxRewardCalcNextAction;