/*global describe, it, inject, beforeEach, module, expect*/

describe('d3-charts', function () {

	describe('d3', function () {
		var d3;

		beforeEach(function () {
			module('d3Charts');
			inject(function (_d3_) {
				d3 = _d3_;
			});
		});

		it('should be injectable', function () {
			expect(typeof d3).toBe('object');
		});

		describe('injected object', function () {
			it('should look like the d3 api', function () {
				expect(d3.selection).toBeTruthy();
				expect(d3.touch).toBeTruthy();
				expect(d3.mouse).toBeTruthy();
				expect(d3.select).toBeTruthy();
			});
		});

	});

});

