/*global describe, it, inject, beforeEach, module, expect*/

describe('dirty tracker', function () {
  var DirtyTracker,
    instance;

  beforeEach(function () {
    module('d3Charts');

    inject(function (_DirtyTracker_) {
      DirtyTracker = _DirtyTracker_;
    });
  });


  it('should be instantiable', function () {
    var instance;

    expect(function () {
      instance = new DirtyTracker();
    }).not.toThrow();

    expect(typeof instance).toBe('object');
  });


  beforeEach(function () {
    instance = new DirtyTracker();
  });

  describe('setDirty method', function () {

    it('should exist and be callable with string names', function () {
      expect(typeof instance.setDirty).toBe('function');

      expect(function () {
        instance.setDirty('keyname');
      }).not.toThrow();
    });

    it('should accept arrays of strings', function () {

      expect(function () {
        instance.setDirty(['keyname1', 'keyname2', 'keyname3']);
      }).not.toThrow();

    });


    it('should not accept any other names than strings or arrays of them', function () {
      expect(function () {
        instance.setDirty({});
      }).toThrow();

      expect(function () {
        instance.setDirty([{}]);
      }).toThrow();

      expect(function () {
        instance.setDirty(true);
      }).toThrow();
    });


  });

  describe('setDependencies', function () {

    it('should only accept a key and an array of strings', function () {
      expect(function () {
        instance.setDependencies('blabla', ['dep1', 'dep2']);
      }).not.toThrow();

      expect(function () {
        instance.setDependencies([], ['dep1', 'dep2']);
      }).toThrow();

      expect(function () {
        instance.setDependencies('blabla', {});
      }).toThrow();
    });

  });

  describe('isDirty method', function () {
    it('should return false for unknown keys', function () {
      expect(instance.isDirty('ntoheun')).toBe(false);
      expect(instance.isDirty('noheu')).toBe(false);
      expect(instance.isDirty('nehixx')).toBe(false);
      expect(instance.isDirty('oeubkh')).toBe(false);
    });

    it('should return true for keys set dirty', function () {
      instance.setDirty('hei');

      expect(instance.isDirty('hei')).toBe(true);
    });

    it('should return true if any dependencies are dirty', function () {
      instance.setDependencies('hei', ['dep1', 'dep2']);

      expect(instance.isDirty('hei')).toBe(false);

      instance.setDirty('dep1');
      expect(instance.isDirty('hei')).toBe(true);

      instance.setDirty('dep2');
      expect(instance.isDirty('hei')).toBe(true);
    });
  });


  describe('clear method', function () {
    it('should reset dirty keys', function () {
      instance.setDirty('hei');
      instance.clear();

      expect(instance.isDirty('hei')).toBe(false);
    });

    it('should not reset dependencies', function () {
      instance.setDependencies('hei', ['dep1', 'dep2']);
      instance.clear();
      instance.setDirty('dep1');

      expect(instance.isDirty('hei')).toBe(true);
    });
  });
});
