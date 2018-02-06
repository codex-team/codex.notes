/**
 * Class for searching through notes
 */
export default class Searcher {

  /**
   * @constructor
   */
  constructor() {
    this.DOM = {
      parent: null,
      serchField: null
    };

    this.dataset = null;
  }

    /**
     * Set data where search will be done
     * @param {Array} data - array to set
     */
  set data( data ) {
    this.dataset = data;
  }

}
