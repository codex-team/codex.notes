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
     * @param el
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
   * @param el
   */
  removeResizer(el) {
    el.removeEventListener('keydown');
    el.removeEventListener('input');
  }

    /**
     * Destroyer
     */
  destroy() {
    for(let i = 0; i < this.elements.length; i++) {
      this.removeResizer(this.elements[i]);
    }

    this.elements = [];
  }

}
