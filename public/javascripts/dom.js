/**
 * DOM manipulations methods
 */
export default class DOM {
  /**
   * Helper for making Elements with classname and attributes
   * @param  {string} tagName           - new Element tag name
   * @param  {array|string} classNames  - list or name of CSS classname(s)
   * @param  {Object} attributes        - any attributes
   * @return {Element}
   */
  static make(tagName, classNames, attributes) {
    var el = document.createElement(tagName);

    if ( Array.isArray(classNames) ) {
      el.classList.add(...classNames);
    } else if( classNames ) {
      el.classList.add(classNames);
    }

    for (let attrName in attributes) {
      el[attrName] = attributes[attrName];
    }

    return el;
  }

  /**
  * Replaces node with
  * @param {Element} nodeToReplace
  * @param {Element} replaceWith
  */
  static replace(nodeToReplace, replaceWith) {
    return nodeToReplace.parentNode.replaceChild(replaceWith, nodeToReplace);
  }

  /**
  * getElementById alias
  * @param {String} elementId
  */
  static get(elementId) {
    return document.getElementById(elementId);
  }

  /**
  * Loads static resourse: CSS or JS
  * @param {string} type  - CSS|JS
  * @param {string} path  - resource path
  * @param {string} inctanceName - unique name of resource
  * @return Promise
  */
  static loadResource(type, path, instanceName) {
    /**
     * Imported resource ID prefix
     * @type {String}
     */
    const resourcePrefix = 'cdx-resourse';

    return new Promise(function (resolve, reject) {
      if (!type || !['JS', 'CSS'].includes(type)) {
        reject(`Unexpected resource type passed. «CSS» or «JS» expected, «${type}» passed`);
      }

      let node;

      /** Script is already loaded */
      if ( !instanceName ) {
        reject('Instance name is missed');
      } else if ( document.getElementById(`${resourcePrefix}-${type.toLowerCase()}-${instanceName}`) ) {
        resolve(path);
      }

      if (type === 'JS') {
        node = document.createElement('script');
        node.async = true;
        node.defer = true;
        node.charset = 'utf-8';
      } else {
        node = document.createElement('link');
        node.rel = 'stylesheet';
      }

      node.id = `${resourcePrefix}-${type.toLowerCase()}-${instanceName}`;

      let timerLabel = `Resource loading ${type} ${instanceName}`;

      console.time(timerLabel);

      node.onload = function () {
        console.timeEnd(timerLabel);
        resolve(path);
      };

      node.onerror = function () {
        console.timeEnd(timerLabel);
        reject(path);
      };

      if (type === 'JS') {
        node.src = path;
      } else {
        node.href = path;
      }

      document.head.appendChild(node);
    });
  }
}
