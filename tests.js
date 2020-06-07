
const { equals } = require('true-equals');

function alike(val1, val2) {
  return !Object.is(val1, val2) && equals(val1, val2);
}

module.exports = { shared_tests, within };

class AssertionError extends Error { }

function assert(bool) {
  if (!bool) throw new AssertionError('assertion failed');
}

const context = [];
function within(name, body) {
  context.push(name);
  body();
  context.pop();
}

function test(name, body) {

  let result;

  try {
    body();
    result = 'success';
  } catch (e) {
    if (e instanceof AssertionError) {
      result = 'improper';
    } else {
      result = 'bug';
    }
  }

  // from https://stackoverflow.com/a/41407246/4608364
  const c_reset = "\x1b[0m";
  const c_bright = "\x1b[1m";
  const c_red = "\x1b[31m";
  const c_green = "\x1b[32m";

  const mark = { success: '+', improper: '-', bug: '!' }[result];
  const color = result === 'success' ? c_green : c_bright + c_red;
  const full_name = [...context, name].join(' > ');
  const text = `${color}[${mark}] ${full_name}${c_reset}`;

  console.log(text);

}

// TODO: develop a true-equals package for true object equality
//       on the same lines as this package

function shared_tests(clone) {

  within('primitives', () => {

    test('null', () => {
      assert(clone(null) === null);
    });

    test('undefined', () => {
      assert(clone(undefined) === undefined);
    });

    test('number', () => {
      assert(clone(1) === 1);
      assert(clone(-1) === -1);
      assert(clone(3.75) === 3.75);
      assert(clone(Number.INFINITY) === Number.INFINITY);
      assert(clone(Number.NEGATIVE_INFINITY) === Number.NEGATIVE_INFINITY);
      assert(Number.isNaN(clone(Number.NaN)));
    });

    test('string', () => {
      assert(clone('') === '');
      assert(clone('string') === 'string');
    });

    test('boolean', () => {
      assert(clone(false) === false);
      assert(clone(true) === true);
    });

    test('symbol', () => {
      const symbol = Symbol();
      assert(clone(symbol) === symbol);
    });

    test('bigint', () => {
      assert(clone(0n) === 0n);
      assert(clone(100n) === 100n);
      assert(clone(-100n) === -100n);
    });

  });

  function testMonkeypatching(object) {
    test('monkeypatched', () => {
      const prop_name = Symbol('monkeypatched');
      object[prop_name] = 'prop val';
      const cloned = clone(object);
      assert(alike(cloned, object));
      assert(cloned[prop_name] === object[prop_name]);
      cloned[prop_name] = 'different';
      assert(cloned[prop_name] !== object[prop_name]);
    });
  }

  within('object types', () => {

    within('Number', () => {
      test('simple', () => {
        const number = new Number(3.14);
        assert(alike(number, clone(number)));
      });

      testMonkeypatching(new Number(3.14));
    });

    within('String', () => {
      test('simple', () => {
        const string = new String('string');
        assert(alike(string, clone(string)));
      });

      testMonkeypatching(new String('imastring'));
    });

    within('Boolean', () => {
      test('simple', () => {
        const boolean = new Boolean(true);
        assert(alike(boolean, clone(boolean)));
      });

      testMonkeypatching(new Boolean(true));
    });

    within('Date', () => {
      test('simple', () => {
        const now = new Date();
        assert(alike(now, clone(now)));
      });

      testMonkeypatching(new Date());
    });

    within('Function', () => {
      // currently unclonable :(
    });

    within('Promise', () => {
      // no real tests at this time
    });

    within('RegExp', () => {
      test('simple', () => {
        const reg = /x/g;
        assert(alike(reg, clone(reg)));
      });

      testMonkeypatching(/x/g);
    });

  });

  within('container types', () => {

    within('Array', () => {

      test('empty', () => {
        const empty = [];
        assert(alike(empty, clone(empty)));
      });

      test('nonempty', () => {
        const nonempty = [Number.INFINITY, 0, undefined, Symbol(), 12n];
        assert(alike(nonempty, clone(nonempty)));
      });

      test('nested', () => {
        const nested = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        assert(alike(nested, clone(nested)));
      });

      test('cyclic', () => {
        const cyclic = ['before', undefined, 'after'];
        cyclic[1] = cyclic;
        const cloned = clone(cyclic);
        assert(cloned[0] === 'before');
        assert(cloned[1] === cloned);
        assert(cloned[2] === 'after');
      });

      test('diamond-shaped', () => {
        const child = ['im', 'child'];
        const parent = ['before', child, 'between', child, 'after'];
        const cloned = clone(parent);
        assert(alike(parent, cloned));
        assert(parent[1] !== cloned[1]);
        assert(cloned[1] === cloned[3]);
      });

      test('sparse', () => {
        const sparse = [1,,3,,5];
        assert(alike(sparse, clone(sparse)));
      });

      testMonkeypatching([3, 1, 4]);

    });

    within('Map', () => {

      test('empty', () => {
        const empty = new Map();
        assert(alike(empty, clone(empty)));
      });

      test('nonempty', () => {
        const nonempty = new Map([['ping', 'x'], ['y', 'pong']]);
        assert(alike(nonempty, clone(nonempty)));
      });

      test('nested', () => {
        const nested = new Map([['m', new Map([['mx', 0]])]]);
        assert(alike(nested, clone(nested)));
      });

      test('cyclic', () => {
        const cyclic = new Map();
        cyclic.set('self', cyclic);
        const cloned = clone(cyclic);
        assert(cloned !== cyclic);
        assert(cloned.size === cyclic.size);
        assert(cloned.get('self') === cloned);
      });

      test('diamond-shaped', () => {
        const child = new Map([['i am', 'child']]);
        const diamond = new Map([['a', child], ['b', child]]);
        const cloned = clone(diamond);
        assert(alike(diamond, cloned));
      });

      testMonkeypatching(new Map([['ping', 'x'], ['y', 'pong']]));

    });

    within('Set', () => {

      test('empty', () => {
        const empty = new Set([]);
        assert(alike(empty, clone(empty)));
      });

      test('nonempty', () => {
        const nonempty = new Set([1, 2, 3]);
        assert(alike(nonempty, clone(nonempty)));
      });

      test('nested', () => {
        const child = new Set(['child']);
        const parent = new Set([child]);
        assert(alike(parent, clone(parent)));
      });

      test('cyclic', () => {
        const cyclic = new Set();
        cyclic.add(cyclic);
        const cloned = clone(cyclic);
        assert(cloned !== cyclic)
        assert(cloned.has(cloned));
      });

      testMonkeypatching(new Set([1, 2, 3]));

    });

    test('WeakMap', () => {
      // TODO
    });

    test('WeakSet', () => {
      // TODO
    });

  });

  within('typed arrays et al', () => {

    within('ArrayBuffer', () => {
      test('simple', () => {
        const buffer = new ArrayBuffer(32);
        assert(alike(buffer, clone(buffer)));
      });

      testMonkeypatching(new ArrayBuffer(16));
    });

    within('SharedArrayBuffer', () => {
      // Doesn't really seem to be any way to test these? :/
    });

    within('DataView', () => {
      test('simple', () => {
        const buffer = new ArrayBuffer(32);
        const view = new DataView(buffer, 1, 16);
        const cloned = clone(view);
        assert(alike(view, cloned));
        assert(view.buffer !== cloned.buffer);
        cloned.setInt16(0, 12);
        assert(view.getInt16(0) !== 12);
        assert(view.getInt16(1) !== 12);
      });

      testMonkeypatching(new DataView(new ArrayBuffer(16)));
    });

    function testTypedArray(constructor, sample_value) {
      within(constructor.name, () => {
        test('empty', () => {
          const empty = new constructor(32);
          assert(alike(empty, clone(empty)));
        });

        test('nonempty', () => {
          const nonempty = new constructor(32);
          nonempty[0] = sample_value;
          nonempty[15] = sample_value;
          nonempty[31] = sample_value;
          assert(alike(nonempty, clone(nonempty)));
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

    within('typed arrays', () => {
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
    within(error.constructor.prototype.name, () => {
      test('simple', () => {
        assert(alike(error, clone(error)));
      });

      testMonkeypatching(error);
    });
  }

  within('errors', () => {
    testError(new Error('message', 'filename', 50));
    testError(new EvalError('message', 'filename', 50));
    testError(new RangeError('message', 'filename', 50));
    testError(new ReferenceError('message', 'filename', 50));
    testError(new SyntaxError('message', 'filename', 50));
    testError(new TypeError('message', 'filename', 50));
    testError(new URIError('message', 'filename', 50));
  });

  within('plain and custom objects', () => {

    test('empty', () => {
      const empty = {};
      assert(alike(empty, clone(empty)));
    });

    test('nonempty', () => {
      const nonempty = { left: 'right', up: 'down', red: 'blue' };
      assert(alike(nonempty, clone(nonempty)));
    });

    test('nested', () => {
      const nested = { child: { val: 'val!' } };
      assert(alike(nested, clone(nested)));
    });

    test('cyclic', () => {
      const object = { };
      object.self = object;
      const cloned = clone(object);
      assert(cloned !== object);
      assert(cloned.self === cloned);
    });

    test('diamond-shaped', () => {
      const child = { i_am: 'child' };
      const parent = { left: child, right: child };
      const cloned = clone(parent);
      assert(alike(cloned, parent));
      assert(cloned.left === cloned.right);
    });

    test('with non-string keys', () => {
      const key = Symbol();
      const nonempty = { [key]: 'val' };
      assert(alike(nonempty, clone(nonempty)));
    });

    test('function prototype instances with no hierarchy', () => {
      function Pair(left, right) {
        this.left = left;
        this.right = right;
      }
      const pair = new Pair(3, 4);
      assert(alike(pair, clone(pair)));
    });

    test('with prototype from Object.create', () => {
      const proto = {
        delimiter: ', ',
        toString() {
          return this.items.join(this.delimiter);
        }
      };
      const object = Object.create(proto);
      object.items = [1, 2, 3];
      assert(alike(object, clone(object)));
    });

    test('ES6 class instances with no hierarchy', () => {
      class Pair {
        constructor(left, right) {
          this.left = left;
          this.right = right;
        }
      }
      const pair = new Pair(3, 4);
      assert(alike(pair, clone(pair)));
    });

    test('ES6 classes with hierarchy', () => {
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
      assert(alike(child, clone(child)));
    });

    test('with getters', () => {
      const object = { val: 'got' };
      Object.defineProperty(object, 'getter', {
        get() { return this.val; }
      });
      const cloned = clone(object);
      assert(alike(object, cloned));
      cloned.val = 'tot';
      assert(cloned.getter === 'tot');
    });

  });

}

function true_clone_tests(package) {

  const { clone, custom_clone } = package;

  within('allows for custom cloners', () => {
    test('on objects', () => {
      const object = {
        [custom_clone]() {
          return 10;
        }
      };
      assert(clone(object) === 10);
    });

    test('on prototypes', () => {
      class Class {
        [custom_clone]() {
          return 10;
        }
      }
      const instance = new Class();
      assert(clone(instance) === 10);
    });
  });

};

// if main module
if (!module.parent) {
  const true_clone = require('./clone.js');
  shared_tests(true_clone.clone);
  true_clone_tests(true_clone);
}
