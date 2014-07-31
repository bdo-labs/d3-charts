/*global describe, it, inject, beforeEach, module, expect, angular, UIEvent*/

describe('drag service', function () {

	function MockEventTarget() {
		var listeners = {};

		this.addEventListener = function (eventName, listener) {
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

		this.dispatchEvent = function (event) {
			var larray = listeners[event.type];
			if (!larray) {
				return;
			}

			larray.forEach(function (l) {
				l(event);
			});
		};

		this.getNumberOfListeners = function (filterByName) {
			var num = 0;

			angular.forEach(listeners, function (larray, name) {
				if (!filterByName || name === filterByName) {
					num += larray.length;
				}
			});

			return num;
		};

		this.clear = function () {
			listeners = {};
		};
	}

	var dragService,
		mock$window = new MockEventTarget(),
		mockElement = new MockEventTarget(),
		f = function () {};

	beforeEach(function () {
		module('d3Charts');
		module(function ($provide) {
			$provide.value('$window', mock$window);
		});

		inject(function (_dragService_) {
			dragService = _dragService_;
		});


		mock$window.clear();
		mockElement.clear();
	});

	describe('watch', function () {
		var dreg;

		beforeEach(function () {
			dreg = dragService.watch(mockElement, f);
		});

		it('should add mouseup listener to window', function () {

			expect(mock$window.getNumberOfListeners('mouseup')).toBe(1);

		});

		it('should add touchend listener to window', function () {

			expect(mock$window.getNumberOfListeners('touchend')).toBe(1);

		});

		it('should add correct listeners to element', function () {

			expect(mockElement.getNumberOfListeners('touchstart')).toBe(1);
			expect(mockElement.getNumberOfListeners('touchmove')).toBe(1);
			expect(mockElement.getNumberOfListeners('mousedown')).toBe(1);
			expect(mockElement.getNumberOfListeners('mousemove')).toBe(1);

		});

		it('should return a deregistration function', function () {
			expect(typeof dragService.watch(mockElement, f)).toBe('function');
		});
	});

	describe('deregistration method', function () {

		it('should deregister all listeners', function () {
			dragService.watch(mockElement, f)();

			expect(mockElement.getNumberOfListeners()).toBe(0);
			expect(mock$window.getNumberOfListeners()).toBe(0);

		});

	});

	describe('callback', function () {
		function generateEvent(type, clientX) {
			var mockEvent = new UIEvent(type);
			mockEvent.clientX = clientX;
			return mockEvent;
		}

		it('should not call listener on mousedown or touchdown', function () {
			var called = false,
				listener = function () {called = true; };

			dragService.watch(mockElement, listener);

			mockElement.dispatchEvent(generateEvent('mousedown', 0));

			expect(called).toBe(false);
		});

		it('should call listener with right arguments when mouse is down and moves', function () {
			var called = false,
				listener = function (arg1, arg2) {
					expect(arg1).toBe(0);
					expect(arg2).toBe(10);
					called = true;
				};

			dragService.watch(mockElement, listener);

			mockElement.dispatchEvent(generateEvent('mousedown', 0));
			mockElement.dispatchEvent(generateEvent('mousemove', 10));

			expect(called).toBe(true);
		});

	});
});
