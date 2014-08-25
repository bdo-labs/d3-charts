/*global angular */

/**
 * A SlidingViewport selects elements whose accessor method returns values
 * within the given bounds. If available, the first element before the lower
 * bound and the first element after the upper bound will also be included to
 * ensure the whole interval is covered.
 */
angular.module('d3Charts').factory('SlidingViewport', [
  'EventHandler', 'd3',
  function (EventHandler, d3) {

    return function SlidingViewport(accessor) {
      accessor = (typeof accessor === 'function' ?
          accessor : angular.identity
        );

      var start = 0,
        end = 0,
        bounds,
        view = [],
        self = this,
        bisect = d3.bisector(accessor),
        source = [];

      /**
       * Recalculates the visible points.
       */
      function calculate() {
        if (!bounds) {
          start = end = 0;
        } else {

          start = bisect.left(source, bounds[0]);
          end = bisect.right(source, bounds[1]);


          // We want our interval to be outside our bounds
          if (start > 0) {
            start--;
          }

          if (end < source.length) {
            end++;
          }

        }

      }

      /**
       * Sets the bounds of the viewport. The first point before the first
       * bound and the first point after the last bound and the points
       * within the bounds will be included in the view.
       *
       * This method will automatically force a recalculation.
       *
       * @param {array(number)} newBounds An array with to items - the
       *     new bounds.
       */
      this.setBounds = function (newBounds) {
        if (!angular.isArray(newBounds) || newBounds.length !== 2) {

          throw new Error('Invalid arguments for setBounds');
        }

        var oldStart = start,
          oldEnd = end;

        // Make a copy (we might alter it)
        newBounds = newBounds.slice(0);

        // ensure correct direction
        if (newBounds[0] > newBounds[1]) {
          newBounds = [newBounds[1], newBounds[0]];
        }

        if (!angular.equals(bounds, newBounds)) {
          bounds = newBounds;

          calculate();

          // Did anything change?
          if (start !== oldStart || end !== oldEnd) {
            view = source.slice(start, end);
            self.dispatchEvent('change');
          }
        }

        return self;
      };

      /**
       * Getter for the current view. Do not save the reference as it
       * might change during view recalculation.
       */
      this.getView = function () {
        return view;
      };


      /**
       * Sets the array containing the data values to search.
       */
      this.setSource = function (newSource) {
        if (!angular.isArray(source)) {
          throw new Error('Source must be an array!');
        }

        if (source !== newSource) {
          source = newSource;
          calculate();
          view = source.slice(start, end);
          self.dispatchEvent('change');
        }

        return self;
      };

      /**
       * Returns the current source.
       */
      this.getSource = function () {
        return source;
      };

      // Mix in event handling
      EventHandler.apply(this);

    };
  }
]);
