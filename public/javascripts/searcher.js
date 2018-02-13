/**
 * Class for searching through notes
 */
export default class Searcher {

  /**
   * @constructor
   */
  constructor() {
    this.DOM = {
      input: document.getElementsByClassName('searcher__input')[0],
      foldersContainer: document.getElementsByName('js-folders-container')[0],
      notes: {
        created: document.getElementsByName('js-notes-menu')[0],
        found: document.getElementsByName('js-found-notes-menu')[0]
      }
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

    this.DOM.input.addEventListener('keyup', () => {
      this.search(this.DOM.input.value);
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

    console.log(found);
  }

}
