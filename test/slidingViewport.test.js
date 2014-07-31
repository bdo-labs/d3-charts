/*global describe, it, inject, beforeEach, module, expect*/

describe('sliding viewport', function () {

	var SlidingViewport;

	beforeEach(function () {
		module('d3Charts');

		inject(function (_SlidingViewport_) {
			SlidingViewport = _SlidingViewport_;
		});
	});

	describe('constructor', function () {
		it('should return an instance', function () {
			var instance = new SlidingViewport();
			expect(typeof instance).toBe('object');
		});

		it('should accept accessor', function () {
			var instance = new SlidingViewport(function (d) {return d.date; });
			expect(typeof instance).toBe('object');
		});

	});

	describe('created instance', function () {
		var instance;

		beforeEach(function () {
			instance = new SlidingViewport();
		});

		it('should return a view', function () {
			expect(instance.getView()).toEqual([]);
		});

		it('should have a setSource method', function () {
			expect(instance.setSource).toBeTruthy();

			expect(function () {
				instance.setSource([]);
			}).not.toThrow();
		});

		it('should have a setBounds method', function () {
			expect(instance.setBounds).toBeTruthy();

			expect(function () {
				instance.setBounds([1, 3]);
			}).not.toThrow();
		});

		it('should return empty view with data, without bounds', function () {
			instance.setSource([1, 2, 3]);
			expect(instance.getView()).toEqual([]);
		});

		it('should update view on source change', function () {
			instance.setBounds([4, 6]);
			instance.setSource([1, 3, 5, 8, 9]);

			expect(instance.getView()).toEqual([3, 5, 8]);

		});

		describe('setBounds method', function () {

			beforeEach(function () {
				instance.setSource([1, 3, 5, 8, 9]);
			});

			it('should select correct view', function () {
				instance.setBounds([4, 6]);

				expect(instance.getView()).toEqual([3, 5, 8]);
			});

			it('should handle bounds outside source array', function () {

				instance.setBounds([100, 200]);
				expect(instance.getView()).toEqual([9]);

				instance.setBounds([-10, -2]);
				expect(instance.getView()).toEqual([1]);

			});

			it('should handle overlapping bounds', function () {

				instance.setBounds([5, 200]);
				expect(instance.getView()).toEqual([3, 5, 8, 9]);

				instance.setBounds([0, 4]);
				expect(instance.getView()).toEqual([1, 3, 5]);

				instance.setBounds([0, 100]);
				expect(instance.getView()).toEqual([1, 3, 5, 8, 9]);
			});

			it('should handle last element correctly', function () {

				instance.setBounds([4, 8.5]);

				expect(instance.getView()).toEqual([3, 5, 8, 9]);

			});


		});
	});


	describe('getSource method', function () {

		it('should return the same reference as given to the instance', function () {

			var instance = new SlidingViewport(),
				source = [];

			instance.setSource(source);

			expect(instance.getSource()).toBe(source);

		});


	});


});
