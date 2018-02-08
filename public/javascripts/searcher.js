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

    /**
     * Where to search
     * @type {Array}
     */
    this.dataset = [];
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
   * @param {String} item - item to find
   */
  search( item ) {
    let found = [];

    this.dataset.forEach((element) => {
      if (element.title.indexOf(item) == 0)      {
        found.push(element);
      }
    });

    return found;
  }

}
