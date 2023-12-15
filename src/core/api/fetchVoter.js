import fetchAllWaxData2 from '../fetchAllWaxData2';
import CONTRACTS from '../consts/CONTRACTS';

const fetchVoter = async ({
    accountName,
}) => {
    const voters = await fetchAllWaxData2({
        params: {
            code: CONTRACTS.WAX,
            scope: CONTRACTS.WAX,
            table: "voters",
            lower_bound: accountName,
            upper_bound: accountName,
        },
        customProcessor: ({row}) => ({
            owner: row.owner,
            proxy: row.proxy,
            producers: row.producers,
            stakedWax: row.staked,
            unpaidVoteShare: row.unpaid_voteshare,
            unpaidVoteShareLastUpdated: new Date(`${row.unpaid_voteshare_last_updated}Z`),
            unpaidVoteShareChangeRate: row.unpaid_voteshare_change_rate,
            lastClaimTime: new Date(`${row.last_claim_time}Z`),
            lastVoteWeight: row.last_vote_weight,
            proxiedVoteWeight: row.proxied_vote_weight,
        }),
    });

    return voters[0];
};

export default fetchVoter;