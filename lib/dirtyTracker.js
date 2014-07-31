/*globals angular*/

/**
 * A DirtyTracker that keeps track of your dirt. More specific it gives you the
 * ability to mark string keys as dirty and check whether a given key is marked
 * dirty. It also supports dependencies (read method comments for further
 * information).
 */
angular.module('d3Charts').value('DirtyTracker', function () {
	var dirtyMap = {},
		dependencies = {},
		self = this;

	function setKey(map, key, value) {
		if (typeof key !== 'string') {
			throw new Error('DirtyTracker only accept string keys!');
		}

		map[key] = value;
	}


	/**
	 * Returns true if the given key is considered dirty. The default value is
	 * false.
	 */
	this.isDirty = function (key) {
		var res  = dirtyMap[key],
			i;

		if (typeof res === 'undefined') {
			res = dependencies[key];
		}

		if (angular.isArray(res)) {

			for (i = 0; i < res.length; i++) {

				if (typeof res[i] !== 'string') {
					throw new Error('DirtyTracker: All dependencies must be strings!');
				}

				if (self.isDirty(res[i])) {
					return true;
				}
			}

			return false;
		}

		return Boolean(res);
	};

	/**
	 * Mark a key or a set of keys as dirty.
	 *
	 * @param {string|array(string)} key Key(s) to set dirty
	 */
	this.setDirty = function (key) {
		if (angular.isArray(key)) {
			key.forEach(self.setDirty);
			return;
		}

		setKey(dirtyMap, key, true);

		return self;
	};

	/**
	 * Set the dependencies of a key. If any of the dependencies are considered
	 * dirty, the key itself will also be considered dirty.
	 *
	 * WARNING: Does not support circular dependencies at the moment!
	 *
	 * @param {array(string)} dependencies Dependencies for the given key
	 */
	this.setDependencies = function (key, deps) {
		if (!angular.isArray(deps)) {
			throw new Error('The dependencies must be an array');
		}

		setKey(dependencies, key, deps);

		return self;
	};

	/**
	 * Clears all key but those who are defaults.
	 */
	this.clear = function () {
		dirtyMap = {};

		return self;
	};

});
