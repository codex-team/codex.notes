/**
 * Autoresizer module
 * Expands dynamically height of textareas
 */

/**
 * @property elements - array of elements
 * @property {Function} addResizer - adds listeners
 * @property {Function} removeResizer - removes listeners
 * @property {Function} destroy - removes all elements and handlers
 */
export default class Autoresizer {

  /**
   * adds autoresize handler
   * @param elements - elements that needs to expand
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
    if (el.value.trim()) {
      el.style.height = el.scrollHeight + 'px';
    } else {
      el.style.height = 'auto';
    }

    el.addEventListener('keydown', this.enterKeyPressed, false);
    el.addEventListener('input', this.resize.bind(this, el), false);
  }

  /**
   * Prevent enter key pressing
   * @param event
   */
  enterKeyPressed(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  }

  /**
   * Resize input
   * @param el
   */
  resize(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  /**
   * removes handlers from element
   * @param {Element} el - element we want to clear from resizer
   */
  removeResizer(el) {
    el.removeEventListener('keydown', this.enterKeyPressed);
    el.removeEventListener('input', this.resize);
  }

  /**
   * Destroyer function. Clears all elements
   */
  destroy() {
    for(let i = 0; i < this.elements.length; i++) {
      this.removeResizer(this.elements[i]);
      this.elements[i].style.height = 'auto';
    }

    this.elements = [];
  }

}
