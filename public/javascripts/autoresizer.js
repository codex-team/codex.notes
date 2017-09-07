/**
 * Autoresizer module
 * Expands dynamically height of textareas
 */
export default class Autoresizer {

  /**
   * adds autoresize handler
   * @param elements
   */
  constructor(elements) {
    this.elements = elements || [];

    for(let i = 0; i < this.elements.length; i++) {
      this.addResizer(this.elements[i]);
    }
  }

    /**
     * autoresizer for textareas
     * @param {Element} el - element we want to expand
     */
  addResizer(el) {
    el.addEventListener('keydown', function (event) {
      if (event.keyCode == 13) {
        event.preventDefault();
      }
    }, false);

    el.addEventListener('input', function (event) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }, false);
  }

  /**
   * removes handlers from element
   * @param {Element} el - element we want to clear from resizer
   */
  removeResizer(el) {
    el.removeEventListener('keydown');
    el.removeEventListener('input');
  }

  /**
   * Destroyer function. Clears all elements
   */
  destroy() {
    for(let i = 0; i < this.elements.length; i++) {
      this.removeResizer(this.elements[i]);
    }

    this.elements = [];
  }

}
