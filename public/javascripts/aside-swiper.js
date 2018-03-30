const SwipeDetector = require('./swipe-detector').default;

/**
 * Aside swiper class
 * @property {object} CSS dictionary
 */
export default class AsideSwiper {
  /**
   * @constructor
   * @param {Function} opened  - opening callback
   * @param {Function} closed  - closing callback
   */
  constructor({opened, closed}) {
    this.CSS = {
      wrapper : 'aside-swiper',
      toggled : 'aside-swiper--toggled',
      left    : 'aside-swiper__left',
      right   : 'aside-swiper__right'
    };

    this.wrapper = document.querySelector(`.${this.CSS.wrapper}`);
    this.left = this.wrapper.querySelector(`.${this.CSS.left}`);
    this.right = this.wrapper.querySelector(`.${this.CSS.right}`);

    this.opened = opened || function () {};
    this.closed = closed || function () {};

    /**
     * Allow to open/close by two-fingers swipe left/right
     */
    new SwipeDetector(this.wrapper, (directionRight) => {
      if (directionRight) {
        this.open();
      } else {
        this.close();
      }
    });
  }

  /**
   * Swipe left menu, shows folder section
   */
  open() {
    this.wrapper.classList.add(this.CSS.toggled);
    this.opened();
  }

  /**
   * Toggle off folder section
   */
  close() {
    this.wrapper.classList.remove(this.CSS.toggled);
    this.closed();
  }
}
