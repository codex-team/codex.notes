/**
 * Class for searching through notes
 */
export default class Searcher {

  /**
   * @constructor
   */
  constructor() {
    this.DOM = {
      searchField: document.getElementsByClassName('searcher__searchField')[0],
      found: document.getElementsByClassName('searcher__found')[0],
    };

    /**
     * Where to search
     * @type {Array}
     */
    this.dataset = [];

    /**
     * Filtered results
     * @type {Array}
     */
    this.found = [];

    this.DOM.searchField.addEventListener('keyup', () => {
      this.search(this.DOM.searchField.value);
    });
  }

  /**
   * Push note data to array where search will be done
   * @param {Object} data - data to push to the dataset
   */
  pushData( data ) {
    let existingDataIndex = this.dataset.length;

    this.dataset.forEach((item, index) => {
      if (item._id == data._id)      {
        existingDataIndex = index;
        return;
      }
    });

    this.dataset.splice(existingDataIndex, 1, data);
  }

  /**
   * Remove note data from array where search will be done
   * @param {Object} data - data to remove from the dataset
   */
  removeData( dataId ) {
    let existingDataIndex = this.dataset.length;

    this.dataset.forEach((item, index) => {
      if (item._id == dataId)      {
        existingDataIndex = index;
        return;
      }
    });

    this.dataset.splice(existingDataIndex, 1);
  }

  /**
   * Find data in the dataset array
   * @param {String} title - key to find data
   */
  search( title ) {
    let found = [];

    this.dataset.forEach((element) => {
      if (element.title.indexOf(title) == 0)      {
        found.push(element);
      }
    });
  }

}
