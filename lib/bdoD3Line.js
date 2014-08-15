/*globals angular*/

/**
 * WARNING: All input is expected to be sorted by date (asc)
 */

angular.module('d3Charts').directive('bdoD3Line', [
	'd3', 'resizeService', 'SlidingViewport', 'dragService', '$q', 'DirtyTracker', '$parse',
	function (d3, resizeService, SlidingViewport, dragService, $q, DirtyTracker, $parse) {

		return {
			scope: false,
			link: function (scope, element, attributes) {
				var dataExpression = attributes.bdoD3Line,
					goalDataExpression = attributes.bdoD3LineGoals,

					viewports = {
						measurements: new SlidingViewport(function (d) {return d.date; }),
						goals: new SlidingViewport(function (d) {return d.date; })
					},

					dirtyTracker = new DirtyTracker()
						.setDependencies('graphs', ['xAxis', 'yAxis', 'circles']),

					deregisterTask = $q.defer(),

					margin = {top: 20, right: 0, bottom: 50, left: 50},

					svg = d3.select(element[0]).append('svg')
						.attr({
							'width': '100%',
							'height': '100%'
						}),
					svgG = svg.append('g')
						.attr(
							'transform',
							'translate(0, ' + margin.top + ')'
						),

					xScale = d3.time.scale(),
					yScale = d3.scale.linear(),

					xAxis = d3.svg.axis()
						.scale(xScale)
						.orient('bottom'),
					yAxis = d3.svg.axis()
						.scale(yScale)
						.ticks(6)
						.orient('right'),

					xAxisG = svgG.append('g')
						.attr('class', 'x axis'),
					yAxisG = svgG.append('g')
						.attr('class', 'y axis'),

					area = d3.svg.area()
						.x(function (d) { return xScale(d.date); })
						.y1(function (d) { return yScale(d.value); }),
					line = d3.svg.line()
						.x(function (d) { return xScale(d.date); })
						.y(function (d) { return yScale(d.value); }),

					clipRect = svg
						.append('defs')
						.append('clipPath')
						.attr('id', 'graph-clip-path')
						.append('rect'),

					graphGroup = svgG.append('g')
						.attr('clip-path', 'url(#graph-clip-path)'),

					measurementArea = graphGroup.append('path')
						.datum(viewports.measurements.getView())
						.attr('class', 'measurement-area'),

					goalLine = graphGroup.append('path')
						.datum(viewports.goals.getView())
						.attr('class', 'goal-line'),

					circleClickHandler = function (d) {

						// Animation
						d3.select(this)
							.transition()
							.duration(100)
							.attr('r', 10)
							.transition()
							.ease('exp')
							.attr('r', 5);

						// Tell others!
						scope.$emit('measurementSelectionChange', d);

					};

				/**
				 * Updates the dirty svg elements. Dirty elements are specified
				 * in the dirty map.
				 */
				function draw() {
					var circlesUpdate,
						oldDomain,
						newDomain;

					// x axis
					if (dirtyTracker.isDirty('xAxis')) {
						// This is usually because the scale domain has changed
						viewports.measurements
							.setBounds(xScale.domain());

						viewports.goals
							.setBounds(xScale.domain());

						xAxisG.call(xAxis);
					}

					// Update the scale on the y axis?
					if (dirtyTracker.isDirty('yScaleDomain')) {
						oldDomain = yScale.domain();
						newDomain = d3.extent(
							viewports.measurements.getView()
								.concat(viewports.goals.getView()),
							function (d) { return d.value; }
						);

						if (!angular.equals(oldDomain, newDomain)) {
							yScale.domain(newDomain);
							dirtyTracker.setDirty('yAxis');
						}
					}

					// y axis
					if (dirtyTracker.isDirty('yAxis')) {
						yAxisG
							.transition()
							.call(yAxis)
							.selectAll('text')
							.tween('attr.x', null)
							.tween('attr.dy', null);

						yAxisG.selectAll('text')
							.attr({
								'x': 10,
								'dy': -10
							});
					}

					// Did any circles get added or removed?
					if (dirtyTracker.isDirty('circles')) {
						circlesUpdate = graphGroup.selectAll('circle')
								.data(viewports.measurements.getView());

						circlesUpdate.enter()
							.append('circle')
							.attr('r', 5)
							.on('click', circleClickHandler);

						circlesUpdate.exit()
							.remove();

						circlesUpdate
							.attr('class', function (d) {return d.className; });
					}

					// Graphs!
					if (dirtyTracker.isDirty('graphs')) {
						measurementArea
							.datum(viewports.measurements.getView())
							.attr('d', area);

						goalLine
							.datum(viewports.goals.getView())
							.attr('d', line);

						graphGroup.selectAll('circle')
							.attr({
								'cx': function (d) {return xScale(d.date); },
								'cy': function (d) {return yScale(d.value); }
							});
					}

					dirtyTracker.clear();
				}


				/**
				 * Retrieves the position of the given screen coordinates in
				 * milliseconds.
				 */
				function getPosition(clientX) {
					return xScale.invert(
						clientX - element[0].clientLeft
					).getTime();
				}


				/**
				 * Handles dragging
				 */
				function dragHandler(oldClientX, newClientX) {
					var diff = getPosition(oldClientX) -
							getPosition(newClientX);

					xScale.domain((function () {
						var domain = xScale.domain();
						return [
							domain[0].setTime(domain[0].getTime() + diff),
							domain[1].setTime(domain[1].getTime() + diff)
						];

					}()));

					dirtyTracker.setDirty('xAxis');

					draw();
				}

				/**
				 * Handles element resizing
				 */
				function resizeHandler(size) {
					var width = size.clientWidth - margin.left - margin.right,
						height = size.clientHeight - margin.top - margin.bottom,
						bottomPosition = size.clientHeight - margin.bottom,
						rightPosition = size.clientWidth - margin.right;


					// Update clipping rectangle
					clipRect.attr({
						x: margin.left,
						y: 0, //Handeled by yScale
						width: width,
						height: bottomPosition
					});

					// Update scales
					xScale.range([margin.left, rightPosition]);
					yScale.range([bottomPosition, margin.top]);

					// Update axes position and ticks
					xAxisG.attr(
						'transform',
						'translate(0, ' + bottomPosition + ')'
					);

					yAxis.tickSize(size.clientWidth);

					// Update area height
					area.y0(size.clientHeight - margin.bottom);

					dirtyTracker.setDirty(['xAxis', 'yAxis', 'graphs']);

					draw();
				}

				// Handle dragging and resizing
				deregisterTask.promise.then(
					dragService.watch(element, dragHandler)
				);

				deregisterTask.promise.then(
					resizeService.watch(element, resizeHandler)
				);

				// Clean up when this scope destroys
				scope.$on('$destroy', function () {
					deregisterTask.resolve();
				});

				// On viewport changes
				viewports.measurements.addEventListener('change', function () {
					dirtyTracker.setDirty(['yScaleDomain', 'circles']);
				});

				viewports.goals.addEventListener('change', function () {
					dirtyTracker.setDirty(['yScaleDomain', 'circles']);
				});


				/**
				 * Schedules a draw at the end of this digest cycle
				 */
				function scheduleDraw() {
					if (scheduleDraw.scheduled) {
						return;
					}

					//WARNING: Unstable interface (angular private method)
					scope.$$postDigest(function () {
						draw();
						scheduleDraw.scheduled = false;
					});
				}

				// Watch for changes in data (deep watch?)
				scope.$watchCollection(dataExpression, function (newData) {
					newData = angular.isArray(newData) ? newData : [];

					// The first time we want to calculate default x position
					if (!viewports.measurements.getSource().length) {
						var lastDate = d3.max(
								newData,
								function (d) {return d.date; }
							) || new Date(),
							size = 182 * 24 * 60 * 60 * 1000; // Approx. half a year

						xScale.domain([
							new Date(lastDate.getTime() - size * 0.6),
							new Date(lastDate.getTime() + size * (1 - 0.6))
						]);

						dirtyTracker.setDirty('xAxis');
					}

					viewports.measurements.setSource(newData);

					dirtyTracker.setDirty(['graphs', 'circles']);

					scheduleDraw();
				});

				scope.$watchCollection(goalDataExpression, function (newData) {
					newData = angular.isArray(newData) ? newData : [];
					viewports.goals.setSource(newData);

					dirtyTracker.setDirty('graphs');

					scheduleDraw();
				});

				/**
				 * Allows the ticks to be calculated using the given expression.
				 */
				attributes.$observe('tickFormat', function (filter) {
					var scopeContext = Object.create(scope);

					if (filter) {

						if (typeof filter !== 'string') {
							throw new Error('The format must be an expression');
						}
						var parsedExpression = $parse(filter);

						yAxis.tickFormat(function (v) {
							scopeContext.value = v;
							return parsedExpression(scopeContext);
						});

						dirtyTracker.setDirty('yAxis');

						scheduleDraw();
					}
				});

			}
		};
	}
]);
