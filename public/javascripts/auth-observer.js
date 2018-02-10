/**
 * @class AuthObserver
 * @classdesc Store user's auth state
 */
export default class AuthObserver {

  /**
   * @constructor
   *
   * @param onLogin - callback to fire when user is logged in
   * @param onLogout - callback to fire when user is logged out
   * @param user - pass if user is logged in on app's initialization
   */
  constructor({onLogin = function () {}, onLogout = function () {}, user = {}}) {
    this.user = null;
    this._loggedIn = false;
    this.onLogin = onLogin;
    this.onLogout = onLogout;

    if (user.token) {
      this.login(user);
    }
  }

  /**
   * Store logged in user state.
   * Fires onLogin callback
   *
   * @param user - logged user
   */
  login(user) {
    this.user = user;
    this._loggedIn = true;
    this.onLogin(user);
  }

  /**
   * Store logged out user state.
   * Fires onLogout callback
   */
  logout() {
    this._loggedIn = false;
    this.onLogout(this.user);
    this.user = null;
  }

  /**
   * Get current login state
   *
   * @returns {boolean}
   */
  get loggedIn() {
    return this._loggedIn;
  }

}
