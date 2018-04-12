/**
 * HashCoder util
 */
let memoizedHashes = {};

/**
 * HashCoder class
 *
 * Util that have hashing methods
 */
export default class hashCoder {
  /**
   * Simple hash method
   * @param {String} text
   */
  static simpleHash(text) {
    /**
     * Returns hash from cache
     */
    if (text && memoizedHashes[text]) {
      return memoizedHashes[text];
    }

    let hash = 0;

    if (text.length == 0) {
      return hash;
    }

    for (let i = 0; i < text.length; i++) {
      let char = text.charCodeAt(i);

      hash = ( (hash << 5) - hash) + char;
      hash = hash & hash;
    }

    // save to cache
    memoizedHashes[text] = hash;
    return hash;
  }
}
