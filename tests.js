
const { equals } = require('true-equals');

const assert = require('assert');

function alike(val1, val2) {
  return !Object.is(val1, val2) && equals(val1, val2);
}

function shared_tests(clone) {

  describe('primitives', () => {

    it('null', () => {
      assert.ok(clone(null) === null);
    });

    it('undefined', () => {
      assert.ok(clone(undefined) === undefined);
    });

    it('number', () => {
      assert.ok(clone(1) === 1);
      assert.ok(clone(-1) === -1);
      assert.ok(clone(3.75) === 3.75);
      assert.ok(clone(Number.INFINITY) === Number.INFINITY);
      assert.ok(clone(Number.NEGATIVE_INFINITY) === Number.NEGATIVE_INFINITY);
      assert.ok(Number.isNaN(clone(Number.NaN)));
    });

    it('string', () => {
      assert.ok(clone('') === '');
      assert.ok(clone('string') === 'string');
    });

    it('boolean', () => {
      assert.ok(clone(false) === false);
      assert.ok(clone(true) === true);
    });

    it('symbol', () => {
      const symbol = Symbol();
      assert.ok(clone(symbol) === symbol);
    });

    it('bigint', () => {
      assert.ok(clone(0n) === 0n);
      assert.ok(clone(100n) === 100n);
      assert.ok(clone(-100n) === -100n);
    });

  });

  function testMonkeypatching(object) {
    it('monkeypatched', () => {
      const prop_name = Symbol('monkeypatched');
      object[prop_name] = 'prop val';
      const cloned = clone(object);
      assert.ok(alike(cloned, object));
      assert.ok(cloned[prop_name] === object[prop_name]);
      cloned[prop_name] = 'different';
      assert.ok(cloned[prop_name] !== object[prop_name]);
    });
  }

  describe('object types', () => {

    describe('Number', () => {
      it('simple', () => {
        const number = new Number(3.14);
        assert.ok(alike(number, clone(number)));
      });

      testMonkeypatching(new Number(3.14));
    });

    describe('String', () => {
      it('simple', () => {
        const string = new String('string');
        assert.ok(alike(string, clone(string)));
      });

      testMonkeypatching(new String('imastring'));
    });

    describe('Boolean', () => {
      it('simple', () => {
        const boolean = new Boolean(true);
        assert.ok(alike(boolean, clone(boolean)));
      });

      testMonkeypatching(new Boolean(true));
    });

    describe('Date', () => {
      it('simple', () => {
        const now = new Date();
        assert.ok(alike(now, clone(now)));
      });

      testMonkeypatching(new Date());
    });

    describe('Function', () => {
      // currently unclonable :(
    });

    describe('Promise', () => {
      // no real its at this time
    });

    describe('RegExp', () => {
      it('simple', () => {
        const reg = /x/g;
        assert.ok(alike(reg, clone(reg)));
      });

      testMonkeypatching(/x/g);
    });

  });

  describe('container types', () => {

    describe('Array', () => {

      it('empty', () => {
        const empty = [];
        assert.ok(alike(empty, clone(empty)));
      });

      it('nonempty', () => {
        const nonempty = [Number.INFINITY, 0, undefined, Symbol(), 12n];
        assert.ok(alike(nonempty, clone(nonempty)));
      });

      it('nested', () => {
        const nested = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        assert.ok(alike(nested, clone(nested)));
      });

      it('cyclic', () => {
        const cyclic = ['before', undefined, 'after'];
        cyclic[1] = cyclic;
        const cloned = clone(cyclic);
        assert.ok(cloned[0] === 'before');
        assert.ok(cloned[1] === cloned);
        assert.ok(cloned[2] === 'after');
      });

      it('diamond', () => {
        const child = ['im', 'child'];
        const parent = ['before', child, 'between', child, 'after'];
        const cloned = clone(parent);
        assert.ok(alike(parent, cloned));
        assert.ok(parent[1] !== cloned[1]);
        assert.ok(cloned[1] === cloned[3]);
      });

      it('sparse', () => {
        const sparse = [1,,3,,5];
        assert.ok(alike(sparse, clone(sparse)));
      });

      testMonkeypatching([3, 1, 4]);

    });

    describe('Map', () => {

      it('empty', () => {
        const empty = new Map();
        assert.ok(alike(empty, clone(empty)));
      });

      it('nonempty', () => {
        const nonempty = new Map([['ping', 'x'], ['y', 'pong']]);
        assert.ok(alike(nonempty, clone(nonempty)));
      });

      it('nested', () => {
        const nested = new Map([['m', new Map([['mx', 0]])]]);
        assert.ok(alike(nested, clone(nested)));
      });

      it('cyclic', () => {
        const cyclic = new Map();
        cyclic.set('self', cyclic);
        const cloned = clone(cyclic);
        assert.ok(cloned !== cyclic);
        assert.ok(cloned.size === cyclic.size);
        assert.ok(cloned.get('self') === cloned);
      });

      it('diamond', () => {
        const child = new Map([['i am', 'child']]);
        const diamond = new Map([['a', child], ['b', child]]);
        const cloned = clone(diamond);
        assert.ok(alike(diamond, cloned));
      });

      testMonkeypatching(new Map([['ping', 'x'], ['y', 'pong']]));

    });

    describe('Set', () => {

      it('empty', () => {
        const empty = new Set([]);
        assert.ok(alike(empty, clone(empty)));
      });

      it('nonempty', () => {
        const nonempty = new Set([1, 2, 3]);
        assert.ok(alike(nonempty, clone(nonempty)));
      });

      it('nested', () => {
        const child = new Set(['child']);
        const parent = new Set([child]);
        assert.ok(alike(parent, clone(parent)));
      });

      it('cyclic', () => {
        const cyclic = new Set();
        cyclic.add(cyclic);
        const cloned = clone(cyclic);
        assert.ok(cloned !== cyclic)
        assert.ok(cloned.has(cloned));
      });

      testMonkeypatching(new Set([1, 2, 3]));

    });

    it('WeakMap', () => {
      // TODO
    });

    it('WeakSet', () => {
      // TODO
    });

  });

  describe('typed arrays et al', () => {

    describe('ArrayBuffer', () => {
      it('simple', () => {
        const buffer = new ArrayBuffer(32);
        assert.ok(alike(buffer, clone(buffer)));
      });

      testMonkeypatching(new ArrayBuffer(16));
    });

    describe('SharedArrayBuffer', () => {
      // Doesn't really seem to be any way to it these? :/
    });

    describe('DataView', () => {
      it('simple', () => {
        const buffer = new ArrayBuffer(32);
        const view = new DataView(buffer, 1, 16);
        const cloned = clone(view);
        assert.ok(alike(view, cloned));
        assert.ok(view.buffer !== cloned.buffer);
        cloned.setInt16(0, 12);
        assert.ok(view.getInt16(0) !== 12);
        assert.ok(view.getInt16(1) !== 12);
      });

      testMonkeypatching(new DataView(new ArrayBuffer(16)));
    });

    function testTypedArray(constructor, sample_value) {
      describe(constructor.name, () => {
        it('empty', () => {
          const empty = new constructor(32);
          assert.ok(alike(empty, clone(empty)));
        });

        it('nonempty', () => {
          const nonempty = new constructor(32);
          nonempty[0] = sample_value;
          nonempty[15] = sample_value;
          nonempty[31] = sample_value;
          assert.ok(alike(nonempty, clone(nonempty)));
        });

        testMonkeypatching(
          (() => {
            const array = new constructor(32);
            array[0] = sample_value;
            array[15] = sample_value;
            array[31] = sample_value;
            return array;
          })(),
          alike);
      });
    }

    describe('typed arrays', () => {
      testTypedArray(BigInt64Array, 12n);
      testTypedArray(BigUint64Array, 12n);
      testTypedArray(Float32Array, 3.14);
      testTypedArray(Float64Array, 3.14);
      testTypedArray(Int8Array, 12);
      testTypedArray(Int16Array, 12);
      testTypedArray(Int32Array, 12);
      testTypedArray(Uint8Array, 12);
      testTypedArray(Uint8ClampedArray, 12);
      testTypedArray(Uint16Array, 12);
      testTypedArray(Uint32Array, 12);
    });

  });

  function testError(error) {
    describe(error.constructor.prototype.name, () => {
      it('simple', () => {
        assert.ok(alike(error, clone(error)));
      });

      testMonkeypatching(error);
    });
  }

  describe('errors', () => {
    testError(new Error('message', 'filename', 50));
    testError(new EvalError('message', 'filename', 50));
    testError(new RangeError('message', 'filename', 50));
    testError(new ReferenceError('message', 'filename', 50));
    testError(new SyntaxError('message', 'filename', 50));
    testError(new TypeError('message', 'filename', 50));
    testError(new URIError('message', 'filename', 50));
  });

  describe('plain and custom objects', () => {

    it('empty', () => {
      const empty = {};
      assert.ok(alike(empty, clone(empty)));
    });

    it('nonempty', () => {
      const nonempty = { left: 'right', up: 'down', red: 'blue' };
      assert.ok(alike(nonempty, clone(nonempty)));
    });

    it('nested', () => {
      const nested = { child: { val: 'val!' } };
      assert.ok(alike(nested, clone(nested)));
    });

    it('cyclic', () => {
      const object = { };
      object.self = object;
      const cloned = clone(object);
      assert.ok(cloned !== object);
      assert.ok(cloned.self === cloned);
    });

    it('diamond', () => {
      const child = { i_am: 'child' };
      const parent = { left: child, right: child };
      const cloned = clone(parent);
      assert.ok(alike(cloned, parent));
      assert.ok(cloned.left === cloned.right);
    });

    it('with non-string keys', () => {
      const key = Symbol();
      const nonempty = { [key]: 'val' };
      assert.ok(alike(nonempty, clone(nonempty)));
    });

    it('function prototype instances with no hierarchy', () => {
      function Pair(left, right) {
        this.left = left;
        this.right = right;
      }
      const pair = new Pair(3, 4);
      assert.ok(alike(pair, clone(pair)));
    });

    it('with prototype from Object.create', () => {
      const proto = {
        delimiter: ', ',
        toString() {
          return this.items.join(this.delimiter);
        }
      };
      const object = Object.create(proto);
      object.items = [1, 2, 3];
      assert.ok(alike(object, clone(object)));
    });

    it('ES6 class instances with no hierarchy', () => {
      class Pair {
        constructor(left, right) {
          this.left = left;
          this.right = right;
        }
      }
      const pair = new Pair(3, 4);
      assert.ok(alike(pair, clone(pair)));
    });

    it('ES6 classes with hierarchy', () => {
      class Parent {
        constructor(p_val) {
          this.p_val = p_val;
        }
      }
      class Child extends Parent {
        constructor(p_val, c_val) {
          super(p_val);
          this.c_val = c_val;
        }
      }
      const child = new Child('p_val', 'c_val');
      assert.ok(alike(child, clone(child)));
    });

    it('with getters', () => {
      const object = { val: 'got' };
      Object.defineProperty(object, 'getter', {
        get() { return this.val; }
      });
      const cloned = clone(object);
      assert.ok(alike(object, cloned));
      cloned.val = 'not';
      assert.ok(cloned.getter === 'not');
    });

  });

}

function true_clone_tests(package) {

  const { clone, custom_clone } = package;

  describe('allows for custom cloners', () => {
    it('on objects', () => {
      const object = {
        [custom_clone]() {
          return 10;
        }
      };
      assert.ok(clone(object) === 10);
    });

    it('on prototypes', () => {
      class Class {
        [custom_clone]() {
          return 10;
        }
      }
      const instance = new Class();
      assert.ok(clone(instance) === 10);
    });
  });

};

// --

if (!process.env.PACKAGE || process.env.PACKAGE === 'true-clone') {

  const true_clone = require('./clone.js');
  shared_tests(true_clone.clone);
  true_clone_tests(true_clone);

} else if (process.env.PACKAGE === 'clone') {

  const clone = require('clone');
  shared_tests(value => clone(value, true, undefined, undefined, true));

} else if (process.env.PACKAGE === 'lodash.clonedeep') {

  const clone = require('lodash.clonedeep');
  shared_tests(clone);

} else if (process.env.PACKAGE === 'rfdc') {

  const clone = require('rfdc')({ proto: false, circles: true });
  shared_tests(clone);

} else {

  console.log("please call with one of PACKGE='', PACKAGE=true-clone, PACKAGE=clone, or PACKAGE=lodash.clonedeep");

}
