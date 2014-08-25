/*globals angular*/

/**
 * Simple constructor for an object supporting basic event handling. The object
 * can be used as a prototype or the constructor can be applied to any object to
 * extend the object with event handeling capabilities.
 */
angular.module('d3Charts').value('EventHandler',
  function eventHandler() {
    var listeners = {};

    this.addEventListener = function (eventName, listener) {
      if (typeof listener !== 'function') {
        throw new Error('Listener must be function');
      }

      if (listeners[eventName]) {
        listeners[eventName].push(listener);
      } else {
        listeners[eventName] = [listener];
      }
    };

    this.removeEventListener = function (eventName, listener) {
      var index = listeners[eventName] ?
          listeners[eventName].indexOf(listener) : -1;

      if (index >= 0) {
        listeners[eventName].splice(index, 1);
      }
    };

    this.dispatchEvent = function (eventName, event) {
      var args = Array.prototype.slice(arguments, 1);

      if (listeners[eventName]) {
        listeners[eventName].forEach(function (listener) {
          listener.apply(null, args);
        });
      }
    };

  });
