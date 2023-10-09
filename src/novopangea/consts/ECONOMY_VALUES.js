module.exports = {
    // set this value if you'd like to ugrage workers to a particular level
    UPGRADE_WORKERS_TO_LVL: 4,
    // maximum external land price bot will agree to
    MAX_LAND_RENT_PRICE_OBSD: 0.00000331,
    // minimum building level to be placed to a land
    MIN_RENT_BUILDING_LEVELS: {
        rest: 3,
        materials: 4,
        food: 4,
        energy: 4,
    },
    // minimum wage your workers agree to work
    JOB_MIN_PROFITS_OBSD: [
        // level 1
        2,
        // level 2
        4.39400,
        // level 3
        6.59100,
        // level 4
        7.69000,
        // level 5
        8.72000,
    ],
    // maximum cost your workers agree to rest
    REST_MAX_COST_OBSD: [
        // level 1
        1.1,
        // level 2
        1.510,
        // level 3
        1.873,
        // level 4
        2.055,
        // level 5
        2.237,
    ],
};