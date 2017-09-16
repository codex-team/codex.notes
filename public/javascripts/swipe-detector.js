/**
 * Two fingers swipe detection class
 */
export default class SwipeDetector {

  /**
  * @constructor
  *
  * @param {Element} el          - Element to handle swipe
  * @param {Function} callback   - Callback for swipe event. Accepts {Boolean} isRight parameter
  *
  *
  * @property {Element} el
  * @property {Function} callback
  * @property {Boolean} swiped         -  Flag user to detect horisontal swipe by mousewheel
  * @property {Timer} wheelTimeout     - Timer for detect swipe
  */
  constructor(el, callback) {
    this.el = el;
    this.callback = callback;
    this.swiped = false;
    this.wheelTimeout = null;

    this.el.addEventListener('mousewheel', event => {
      this.detectSwipeLeft(event);
    });
  }

  /**
   * Allow to toggle off menu by two-fingers Mac swiep
   * @param {WheelEvent} event - mouse wheel
   */
  detectSwipeLeft(event) {
    /**
     * Detect horisontal scroll
     */
    if (event.wheelDeltaY === 0) {
      if (!this.swiped) {
        this.swiped = true;

        /**
         * Pass isRight parameter. True for right swipe, false for left swipe
         */
        this.callback(event.deltaX > 0);

        this.wheelTimeout = window.setTimeout( () => {
          this.swiped = false;
        }, 1000);
      }
    }
  }
}
