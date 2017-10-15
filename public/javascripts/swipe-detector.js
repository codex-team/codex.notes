/**
 * Two fingers swipe detection class
 */
export default class SwipeDetector {

  /**
  * @constructor
  *
  * @param {Element} el          - Element to handle swipe
  * @param {Function} callback   - Callback for swipe event. Accepts {Boolean} directionRight parameter
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
      this.detectSwipe(event);
    });
  }

  /**
   * Detects two-fingers swipe and fires callback
   * @fires this.callback
   * @param {WheelEvent} event - mouse wheel
   */
  detectSwipe(event) {
    /**
     * Detect horisontal scroll
     * @type {Boolean}
     */
    let isHorisontal = event.wheelDeltaY === 0;

    /**
     * Dont fire swipe event on small scrolls
     * @type {Boolean}
     */
    let swipeEnoughLong = event.wheelDeltaX > 30 || event.wheelDeltaX < -30;

    if ( isHorisontal && swipeEnoughLong ) {
      if (!this.swiped) {
        this.swiped = true;

        /**
         * Pass directionRight parameter. True for right swipe, false for left swipe
         */
        this.callback(event.deltaX > 0);

        this.wheelTimeout = window.setTimeout( () => {
          this.swiped = false;
        }, 1000);
      }
    }
  }
}
