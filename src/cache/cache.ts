const NodeCache = require('node-cache');

const nCache = new NodeCache({
    useClones: false
});

class Cache {
    getData(cacheKey) {
        return nCache.get(cacheKey);
    }

    delete(cacheKey) {
        return nCache.del(cacheKey);
    }

    setData(cacheKey, value) {
        nCache.set(cacheKey, value);
    }
}

export default new Cache();
