const DEFAULT_DURATION = 5 * 60 * 1000;
const cache = {};

export const getCache = (key) => {
    if (cache[key] == null) {
        return null;
    }

    if (cache[key].expiredAt < Date.now()) {
        return null;
    }

    return cache[key].data;
};

export const writeCache = (data, key, duration = DEFAULT_DURATION) => {
    cache[key] = {
        data,
        expiredAt: Date.now() + duration,
    };
};
