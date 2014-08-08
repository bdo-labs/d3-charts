/*global angular*/
/**
 * Pie chart.
 */
angular.module('d3Charts').directive('bdoD3Pie', [
	'd3', 'resizeService',
	function (d3, resizeService) {


		return {

			link: function (scope, element, attributes) {
				var dataExpression = attributes.bdoD3Pie,
					data = [],
					svg = d3.select(element[0]).append('svg')
						.attr({
							'width': '100%',
							'height': '100%'
						}),
					text = svg.append('text'),
					graphGroup = svg.append('g'),
					arc = d3.svg.arc(),
					pie = d3.layout.pie()
						.value(function (d) {return d.value; }),

					resizeDeregister;

				/**
				 * Slips the specific value in between each element in the
				 * provided array. A new array is returned and the original
				 * array is not altered. That is:
				 *
				 * slipIn([1, 2, 3], 5) //returns a new array: [1, 5, 2, 5, 3]
				 */
				function slipIn(array, element) {
					return array.reduce(function (newArray, value) {
						if (newArray.length) {
							newArray.push(element);
						}

						newArray.push(value);

						return newArray;
					}, []);

				}


				function draw() {
					var graphPaths,
						textSpans;

					// Update the graph itself
					graphPaths = graphGroup.selectAll('path')
						.data(pie(data));

					graphPaths.enter()
						.append('path');

					graphPaths.exit()
						.remove();

					graphPaths
						.attr('d', arc)
						.attr('class', function (d) {return d.data.className; });

					// Now handle the text below
					textSpans = text.selectAll('tspan')
						.data(slipIn(data, {value: ' / '}));

					textSpans.enter()
						.append('tspan');

					textSpans.exit()
						.remove();

					textSpans
						.text(function (d) {return d.value; })
						.attr('class', function (d) {return d.className; });


				}

				/**
				 * Handles resizing of the graph!
				 */
				function resizeHandler(size) {
					var width = size.clientWidth,
						height = size.clientHeight - 40,
						radius = 0.9 * Math.min(width, height) / 2;

					// Move circle into position
					graphGroup
						.attr(
							'transform',
							'translate(' + (width / 2) + ', ' + (height / 2) + ')'
						);

					// Set correct radius
					arc
						.innerRadius(radius * 0.7)
						.outerRadius(radius);

					// Reposition text
					text
						.attr({
							'x': width / 2,
							'y': height + 20
						});

					draw();
				}

				resizeDeregister = resizeService.watch(element, resizeHandler);
				scope.$on('$destroy', resizeDeregister);


				scope.$watch(dataExpression, function (newData) {
					data = angular.isArray(newData) ? newData : [];

					// Let's check whether there are any valid values
					var sum = newData.reduce(function (result, item) {
						return result + (item.value > 0);
					}, 0);

					if (newData.length && sum === 0) {
						data = [];
					}

					draw();
				});
			}

		};

	}
]);
