/*globals angular*/

angular.module('d3Charts').service('resizeService', [
  '$window',
  function ($window) {


    /**
     * Watches the window and scope to detect element size changes.
     * @return {function} A deregister for cleaning up listeners.
     */
    this.watch = function (element, listener) {
      var lastSize,
        resizeListener,
        watchDestructor;

      function getSize() {
        return {
          clientWidth: element[0].clientWidth,
          clientHeight: element[0].clientHeight
        };
      }

      function fireUpdate(size) {
        lastSize = size;
        listener(size);
      }

      element = angular.element(element);
      lastSize = getSize();

      // Watch on scope changes
      watchDestructor = element.scope().$watchCollection(
        function () {
          return getSize();
        },
        fireUpdate
      );

      resizeListener = function () {
        var newSize = getSize();

        if (!angular.equals(newSize, lastSize)) {
          fireUpdate(newSize);
        }
      };

      // Check on window resize
      $window.addEventListener('resize', resizeListener);


      // Return a deregister method for cleaning up
      return function () {
        $window.removeEventListener('resize', resizeListener);
        watchDestructor();
      };
    };

  }
]);
