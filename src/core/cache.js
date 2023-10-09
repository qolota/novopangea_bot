const DEFAULT_DURATION = 5 * 60 * 1000;
const cache = {};

const getCache = (key) => {
    if (cache[key] == null) {
        return null;
    }

    if (cache[key].expiredAt < Date.now()) {
        return null;
    }

    return cache[key].data;
};

const writeCache = (data, key, duration = DEFAULT_DURATION) => {
    cache[key] = {
        data,
        expiredAt: Date.now() + duration,
    };
};

module.exports = {
    getCache,
    writeCache,
};
