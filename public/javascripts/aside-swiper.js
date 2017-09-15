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
      left: 'aside-swiper__left',
      right: 'aside-swiper__right'
    };

    this.wrapper = document.querySelector(`.${this.CSS.wrapper}`);
    this.left = this.wrapper.querySelector(`.${this.CSS.left}`);
    this.right = this.wrapper.querySelector(`.${this.CSS.right}`);
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
