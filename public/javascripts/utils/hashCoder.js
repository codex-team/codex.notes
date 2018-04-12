/**
 * HashCoder util
 */
let memoizedHashes = {};

export default class hashCoder {

    /**
     * Simple hash method
     */
    static simpleHash(string) {

        /**
         * Returns hash from cache
         */
        if (string && memoizedHashes[string]) {
            return memoizedHashes[string]
        }

        let hash = 0;

        if (string.length == 0) {
            return hash;
        }

        for (let i = 0; i < string.length; i++) {
            let char = string.charCodeAt(i);
            hash = ( (hash << 5) - hash) + char;
            hash = hash & hash;
        }

        // save to cache
        memoizedHashes[string] = hash;
        return hash;
    }

}
