/**
 * @module Time
 * @description Helper for working with timestamps in Seconds
 */
class Time {

  /**
   * Return current timestamp in Seconds
   * Used to corresponds with Server Timestamps
   * @return {number}
   */
  static get now() {
    return parseInt(+new Date() / 1000, 10);
  }

}

module.exports = Time;