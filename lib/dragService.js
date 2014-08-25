/*globals angular*/

angular.module('d3Charts').service('dragService', [
  '$window',
  function ($window) {

    /**
     * Expects a (DOM or jq[Lite]) element and a listener that should be
     * called when someone drags the element using their mouse or touch
     * device. The listener will be called when the mouse or touch "drags"
     * over the surface with the old and new clientX coordinates.
     */
    this.watch = function (element, listener) {
      // Ensured jqLite element
      element = angular.element(element);

      var dragging = false,
        lastClientX,
        touchId,
        handlers;


      function stopMove() {
        dragging = false;
        element.removeClass('dragging');
      }

      function startMove(clientX) {
        dragging = true;
        lastClientX = clientX;
        element.addClass('dragging');
      }

      function processMove(clientX) {
        if (!dragging) {
          return;
        }

        listener(lastClientX, clientX);
        lastClientX = clientX;
      }

      handlers = {
        mousedown: function (e) {
          startMove(e.clientX);
          e.preventDefault();
        },
        mouseup: stopMove,
        mousemove: function (e) {
          processMove(e.clientX);
        },

        touchstart: function (e) {
          touchId = e.touches[0].identifier;
          startMove(e.touches[0].clientX);
          e.preventDefault();
        },

        touchend: function (e) {
          var match = e.touches.identifiedTouch(touchId);
          if (match) {
            stopMove(match.clientX);
          }
        },

        touchmove: function (e) {
          var match = e.touches.identifiedTouch(touchId);
          if (match) {
            processMove(match.clientX);
          }
        }
      };

      /**
       * Simplify registration and deregistration of event listener
       */
      function registerListeners(el, eventNames, reverse) {
        var methodName = (reverse ? 'remove' : 'add') + 'EventListener';

        eventNames.forEach(function (eventName) {
          el[methodName](eventName, handlers[eventName]);
        });
      }


      // Register listener
      registerListeners(element[0], [
        'mousedown', 'mousemove', 'touchstart', 'touchmove'
      ]);

      registerListeners($window, ['mouseup', 'touchend']);

      // Return deregister method
      return function () {

        registerListeners(element[0], [
          'mousedown', 'mousemove', 'touchstart', 'touchmove'
        ], true);

        registerListeners($window, ['mouseup', 'touchend'], true);
      };

    };

  }
]);
