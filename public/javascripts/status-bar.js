/**
 * @module StatusBar
 * @description Module for working with Aside Status Bar
 *
 * @typedef {StatusBar} StatusBar
 * @property {Element} statusBar - Status Bar Element
 */
export default class StatusBar {

  /**
   * @constructor
   * Find status bar Element, init all stuff
   */
  constructor() {
    this.statusBar = document.getElementById('status-bar');
  }

  /**
   * CSS class names
   */
  static get CSS() {
    return {
      blinked: 'status-bar--blinked',
      loading: 'status-bar--loading'
    };
  }

  /**
   * Update text in the Status Bar
   * @param {string} statusText - new text
   */
  set text(statusText) {
    this.statusBar.textContent = statusText;

    this.statusBar.classList.add(StatusBar.CSS.blinked);
    window.setTimeout(() => {
      this.statusBar.classList.remove(StatusBar.CSS.blinked);
    }, 400);
  }

  /**
   * Status Bar text getter
   */
  get text() {
    return this.statusBar.textContent;
  }

  /**
   * Set loading state
   * @param {boolean} state - true|false
   */
  set loading(state) {
    this.statusBar.classList.toggle(StatusBar.CSS.loading, state);
  }
}