/**
 * Codex Note ShortCuts class
 * Handles keyDowns on Note.
 *
 * Used to create shortcuts on element
 */

/**
 * List of key codes
 */
const keyCodes = {
  '0' : 48,
  '1' : 49,
  '2' : 50,
  '3' : 51,
  '4' : 52,
  '5' : 53,
  '6' : 54,
  '7' : 55,
  '8' : 56,
  '9' : 57,
  'A' : 65,
  'B' : 66,
  'C' : 67,
  'D' : 68,
  'E' : 69,
  'F' : 70,
  'G' : 71,
  'H' : 72,
  'I' : 73,
  'J' : 74,
  'K' : 75,
  'L' : 76,
  'M' : 77,
  'N' : 78,
  'O' : 79,
  'P' : 80,
  'Q' : 81,
  'R' : 82,
  'S' : 83,
  'T' : 84,
  'U' : 85,
  'V' : 86,
  'W' : 87,
  'X' : 88,
  'Y' : 89,
  'Z' : 90
};

const supportedCommands = {
  'CMD' : ['CMD', 'CONTROL', 'COMMAND', 'WINDOWS', 'CTRL'],
  'SHIFT' : [ 'SHIFT' ],
  'ALT' : ['ALT', 'OPTION']
};

/**
 * @class ShortCuts
 * @classdesc Callback will be fired with two params:
 *   - event: standard keyDown param
 *   - target: element which registered on shortcut creation
 *
 * @typedef {Object} ShortCut
 * @property {String} name - shortcut name
 * @property {Element} on - element that passed on shortcut creation
 * @property {Function} callback - custom user function
 */
export default class ShortCut {

  /**
   * Create new shortcut
   * @param {ShortCut} shortcut
   * @constructor
   */
  constructor(shortcut) {
    this.commands = {};
    this.keys = {};

    this.parseShortcutName(shortcut.name);

    this.element = shortcut.on;
    this.callback = shortcut.callback;
    this.element.addEventListener('keydown', (event) => {
      this.executeShortcut(event);
    }, false);
  }

  /**
   * parses string to get shortcut commands in uppercase
   * @param {String} shortcut
   *
   * @return {Array} keys
   */
  parseShortcutName(shortcut) {
    shortcut = shortcut.split('+');

    for (let key = 0; key < shortcut.length; key++) {
      shortcut[key] = shortcut[key].toUpperCase();

      if (shortcut[key].length > 1) {
        for (let command in supportedCommands) {
          if (supportedCommands[command].includes(shortcut[key])) {
            this.commands[command] = true;
          }
        }
      } else {
        this.keys[shortcut[key]] = true;
      }
    }
  }

  /**
   *
   * @param event
   */
  executeShortcut(event) {
    let cmdKey = (event.ctrlKey || event.metaKey),
        shiftKey = event.shiftKey,
        altKey = event.altKey,
        passed = {
          'CMD': cmdKey,
          'SHIFT': shiftKey,
          'ALT': altKey
        };

    console.log('event', event);
    let command,
        allCommandsPassed = true;

    for (command in this.commands) {
      allCommandsPassed = allCommandsPassed && passed[command];
    }

    let key,
        allKeysPassed = true;

    for (key in this.keys) {
      allKeysPassed = allKeysPassed && ( event.keyCode === keyCodes[key] );
    }

    if (allCommandsPassed && allKeysPassed) {
      this.callback.call(null, event);
    }
  }

  /**
   * Destroy shortcut: remove listener from element
   */
  remove() {
    this.element.removeEventListener('keydown', this.callback);
  }
}
