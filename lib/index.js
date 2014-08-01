
/**
 * Module dependencies.
 */
var angular = require('angular');

/**
 * Expose {{basename}}.
 */
module.exports = angular.module('d3Charts', []);

require('./d3.js');
require('./eventHandler.js');
require('./slidingViewport.js');
require('./resizeService.js');
require('./dragService.js');
require('./dirtyTracker.js');
require('./bdoD3Line.js');
require('./bdoD3Pie.js');
