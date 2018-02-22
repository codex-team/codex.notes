/**
 * Class for searching through notes
 */
export default class Searcher {

  /**
   * @constructor
   */
  constructor() {
    /**
     * DOM tree of class
     * @type {Object}
     */
    this.DOM = {
      input: document.getElementsByClassName('searcher__input')[0],
      foldersContainer: document.getElementsByName('js-folders-container')[0],
      notes: {
        created: document.getElementsByName('js-notes-menu')[0],
        found: document.getElementsByName('js-found-notes-menu')[0]
      }
    };

    /**
     * CSS classes for DOM
     * @type {Object}
     */
    this.CSS = {
      hidden: 'searcher__hidden'
    };

    /**
     * Default value in the search input form
     * @type {String}
     */
    this.defaultInputValue = 'Search';

    /**
     * Where to search
     * @type {Array}
     */
    this.dataset = [];

    /**
     * Keyword from search field saved after search mode was disabled
     * @type {Strng}
     */
    this.lastSearch = '';

    this.DOM.input.addEventListener('focus', () => {
      this.DOM.notes.created.classList.add(this.CSS.hidden);
      this.DOM.notes.found.classList.remove(this.CSS.hidden);
      this.DOM.foldersContainer.classList.add(this.CSS.hidden);

      this.DOM.input.value = this.lastSearch;
    });

    this.DOM.input.addEventListener('blur', (event) => {
      if (event.relatedTarget != this.DOM.notes.found) {
        this.DOM.notes.found.classList.add(this.CSS.hidden);
        this.DOM.notes.found.classList.add(this.CSS.hidden);
        this.DOM.notes.created.classList.remove(this.CSS.hidden);
        this.DOM.foldersContainer.classList.remove(this.CSS.hidden);

        this.lastSearch = this.DOM.input.value;
        this.DOM.input.value = this.defaultInputValue;
      }
    });

    this.DOM.input.addEventListener('keyup', () => {
      this.search(this.DOM.input.value);
    });
  }

  /**
   * Cleans search results
   * @param {Object} data - data to push to the dataset
   */
  reset() {
    let found = this.DOM.notes.found,
        parent = found.parentNode;

    this.DOM.notes.found = parent.removeChild(found).cloneNode(false);
    parent.appendChild(this.DOM.notes.found);
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
   * @param {Object} dataId - the id of data to remove from the dataset
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
    let highlight = {
      start: 0,
      end: 0
    };

    this.reset();

    this.dataset.forEach((element) => {
      highlight.start = element.title.indexOf(title);

      if (highlight.start > -1)      {
        highlight.end = highlight.start + title.length;
        codex.notes.aside.addMenuItem(element, true, {highlight: highlight});
      }
    });
  }

}
