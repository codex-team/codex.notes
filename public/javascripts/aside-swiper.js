const SwipeDetector = require('./swipe-detector').default;

/**
 * Aside swiper class
 */
export default class AsideSwiper {

  /**
  * @constructor
  * @property {object} CSS dictionary
  */
  constructor() {
    this.CSS = {
      wrapper : 'aside-swiper',
      toggled : 'aside-swiper--toggled',
      left    : 'aside-swiper__left',
      right   : 'aside-swiper__right'
    };

    this.wrapper = document.querySelector(`.${this.CSS.wrapper}`);
    this.left = this.wrapper.querySelector(`.${this.CSS.left}`);
    this.right = this.wrapper.querySelector(`.${this.CSS.right}`);

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
  }

  /**
   * Toggle off folder section
   */
  close() {
    this.wrapper.classList.remove(this.CSS.toggled);
  }
}
