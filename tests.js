
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

  function testMonkeypatching(object, matches) {
    test('monkeypatched', () => {
      const prop_name = Symbol();
      object[prop_name] = 'prop val';
      const cloned = clone(object);
      assert(matches(cloned, object));
      assert(cloned[prop_name] === object[prop_name]);
      cloned[prop_name] = 'different';
      assert(cloned[prop_name] !== object[prop_name]);
    });
  }

  within('object types', () => {

    within('Number', () => {
      function Number_matches(number_1, number_2) {
        return number_1 !== number_2 && +number_1 === +number_2;
      }

      test('simple', () => {
        const number = new Number(3.14);
        assert(Number_matches(number, clone(number)));
      });

      testMonkeypatching(new Number(3.14), Number_matches);
    });

    within('String', () => {
      function String_matches(str1, str2) {
        return str1 !== str2 && '' + str1 === '' + str2;
      }

      test('simple', () => {
        const string = new String('string');
        assert(String_matches(string, clone(string)));
      });

      testMonkeypatching(new String('imastring'), String_matches);
    });

    test('Boolean', () => {
    });

    within('Date', () => {
      function Date_matches(date1, date2) {
        return date1 !== date2 && date1.toISOString() == date2.toISOString();
      }

      test('simple', () => {
        const now = new Date();
        assert(Date_matches(now, clone(now)));
      });

      testMonkeypatching(new Date(), Date_matches);
    });

    test('Function', () => {
    });

    test('Promise', () => {
    });

    within('RegExp', () => {
      function RegExp_matches(reg1, reg2) {
        return (
          reg1 !== reg2
          && reg1.lastIndex === reg2.lastIndex
          && reg1.dotAll === reg2.dotAll
          && reg1.flags === reg2.flags
          && reg1.global === reg2.global
          && reg1.ignoreCase === reg2.ignoreCase
          && reg1.multiline === reg2.multiline
          && reg1.source === reg2.source
          && reg1.sticky === reg2.sticky
          && reg1.unicode === reg2.unicode
        );
      }

      test('simple', () => {
        const reg = /x/g;
        assert(RegExp_matches(reg, clone(reg)));
      });

      testMonkeypatching(/x/g, RegExp_matches);
    });

  });

  within('container types', () => {

    within('Array', () => {

      function Array_matches(ar1, ar2) {
        // contents equality tested with ===
        // except for in the case of nested arrays
        if (ar1 === ar2 || ar1.length !== ar2.length)
          return false;

        for (let i = 0; i < ar1.length; i++) {
          const val1 = ar1[i];
          const val2 = ar2[i];
          const are_equal =
            val1 instanceof Array
              ? val2 instanceof Array && Array_matches(val1, val2)
              : val1 === val2;

          if (!are_equal) return false;
        }

        return true;
      }

      test('empty', () => {
        const empty = [];
        assert(Array_matches(empty, clone(empty)));
      });

      test('nonempty', () => {
        const nonempty = [Number.INFINITY, 0, undefined, Symbol(), 12n];
        assert(Array_matches(nonempty, clone(nonempty)));
      });

      test('nested', () => {
        const nested = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        assert(Array_matches(nested, clone(nested)));
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
        assert(Array_matches(parent, cloned));
        assert(parent[1] !== cloned[1]);
        assert(cloned[1] === cloned[3]);
      });

      testMonkeypatching([3, 1, 4], Array_matches);

    });

    within('Map', () => {

      function Map_matches(map1, map2) {
        if (map1 === map2 || map1.size !== map2.size)
          return false;

        for (const key of map1.keys()) {
          if (!map2.has(key)) return false;
          const val1 = map1.get(key);
          const val2 = map2.get(key);
          const are_equal =
            val1 instanceof Map
              ? val2 instanceof Map && Map_matches(val1, val2)
              : val1 === val2;

          if (!are_equal) return false;
        }

        return true;
      }

      test('empty', () => {
        const empty = new Map();
        assert(Map_matches(empty, clone(empty)));
      });

      test('nonempty', () => {
        const nonempty = new Map([['ping', 'x'], ['y', 'pong']]);
        assert(Map_matches(nonempty, clone(nonempty)));
      });

      test('nested', () => {
        const nested = new Map([['m', new Map([['mx', 0]])]]);
        assert(Map_matches(nested, clone(nested)));
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
        assert(Map_matches(diamond, cloned));
      });

      testMonkeypatching(new Map([['ping', 'x'], ['y', 'pong']]), Map_matches);

    });

    within('Set', () => {

      function Set_matches(set1, set2) {
        if (set1 === set2 || set1.size !== set2.size)
          return false;

        for (const item of set1) {
          const is_contained =
            item instanceof Set
              ? [...set2].some(s => s instanceof Set && Set_matches(item, s))
              : set2.has(item);

          if (!is_contained) return false;
        }

        return true;
      }

      test('empty', () => {
        const empty = new Set([]);
        assert(Set_matches(empty, clone(empty)));
      });

      test('nonempty', () => {
        const nonempty = new Set([1, 2, 3]);
        assert(Set_matches(nonempty, clone(nonempty)));
      });

      test('nested', () => {
        const child = new Set(['child']);
        const parent = new Set([child]);
        assert(Set_matches(parent, clone(parent)));
      });

      test('cyclic', () => {
        const cyclic = new Set();
        cyclic.add(cyclic);
        const cloned = clone(cyclic);
        assert(cloned !== cyclic)
        assert(cloned.has(cloned));
      });

      test('diamond-shaped', () => {
        // N/A
      });

      testMonkeypatching(new Set([1, 2, 3]), Set_matches);

    });

    test('WeakMap', () => {
      // TODO
    });

    test('WeakSet', () => {
      // TODO
    });

  });

  within('typed arrays et al', () => {

    function ArrayBuffer_matches(ab1, ab2) {
      const view1 = new Int8Array(ab1);
      const view2 = new Int8Array(ab2);
      return TypedArray_matches(view1, view2);
    }

    within('ArrayBuffer', () => {
      test('simple', () => {
        const buffer = new ArrayBuffer(32);
        assert(ArrayBuffer_matches(buffer, clone(buffer)));
      });

      testMonkeypatching(new ArrayBuffer(16), ArrayBuffer_matches);
    });

    within('SharedArrayBuffer', () => {
      // Doesn't really seem to be any way to test these? :/
    });

    function DataView_matches(dv1, dv2) {
      return (
        dv1 !== dv2
        && dv1.byteOffset === dv2.byteOffset
        && dv1.byteLength === dv2.byteLength
        && ArrayBuffer_matches(dv1.buffer, dv2.buffer)
      );
    }

    within('DataView', () => {
      test('simple', () => {
        const buffer = new ArrayBuffer(32);
        const view = new DataView(buffer, 1, 16);
        const cloned = clone(view);
        assert(DataView_matches(view, cloned));
        assert(view.buffer !== cloned.buffer);
        cloned.setInt16(0, 12);
        assert(view.getInt16(0) !== 12);
        assert(view.getInt16(1) !== 12);
      });

      testMonkeypatching(new DataView(new ArrayBuffer(16)), DataView_matches);
    });

    function TypedArray_matches(ta1, ta2) {
      if (ta1 === ta2 || ta1.length !== ta2.length)
        return false;

      for (let i = 0; i < ta1.length; i++) {
        if (ta1[i] !== ta2[i]) return false;
      }

      return true;
    }

    function testTypedArray(constructor, sample_value) {
      within(constructor.name, () => {
        test('empty', () => {
          const empty = new constructor(32);
          assert(TypedArray_matches(empty, clone(empty)));
        });

        test('nonempty', () => {
          const nonempty = new constructor(32);
          nonempty[0] = sample_value;
          nonempty[15] = sample_value;
          nonempty[31] = sample_value;
          assert(TypedArray_matches(nonempty, clone(nonempty)));
        });

        testMonkeypatching(
          (() => {
            const array = new constructor(32);
            array[0] = sample_value;
            array[15] = sample_value;
            array[31] = sample_value;
            return array;
          })(),
          TypedArray_matches,
        );
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
      function Error_matches(err1, err2) {
        return (
          err1 !== err2
          && err1.constructor == err2.constructor
          && err1.message == err2.message
          && err1.fileName == err2.fileName
          && err1.lineNumber == err2.lineNumber
        );
      }

      test('simple', () => {
        assert(Error_matches(error, clone(error)));
      });

      testMonkeypatching(error, Error_matches);
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

    function Object_matches(obj1, obj2) {

      if (obj1 === obj2)
        return false;

      if (Object.getPrototypeOf(obj1) !== Object.getPrototypeOf(obj2))
        return false;

      const descriptors1 = Object.getOwnPropertyDescriptors(obj1);
      const descriptors2 = Object.getOwnPropertyDescriptors(obj2);

      const keys1 = Reflect.ownKeys(obj1);
      const keys2 = Reflect.ownKeys(obj2);

      if (keys1.length !== keys2.length)
        return false;

      for (const key of keys1) {
        const descriptor1 = descriptors1[key];
        const descriptor2 = descriptors2[key];

        if (!(
          descriptor1.configurable === descriptor2.configurable
          && descriptor1.enumerable === descriptor2.enumerable
          && descriptor1.writable === descriptor2.writable
          && descriptor1.get === descriptor2.get
          && descriptor1.set === descriptor2.set
        ))
          return false;

        const value1 = descriptor1.value;
        const value2 = descriptor2.value;

        const value1_is_obj = typeof value1 === 'object' && value1 !== null;
        const value2_is_obj = typeof value2 === 'object' && value2 !== null;
        if (value1_is_obj || value2_is_obj) {
          if (!(value1_is_obj && value2_is_obj))
            return false;
          return Object_matches(value1, value2);
        } else {
          return value1 === value2;
        }
      }

      return true;

    }

    test('empty', () => {
      const empty = {};
      assert(Object_matches(empty, clone(empty)));
    });

    test('nonempty', () => {
      const nonempty = { left: 'right', up: 'down', red: 'blue' };
      assert(Object_matches(nonempty, clone(nonempty)));
    });

    test('nested', () => {
      const nested = { child: { val: 'val!' } };
      assert(Object_matches(nested, clone(nested)));
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
      assert(Object_matches(cloned, parent));
      assert(cloned.left === cloned.right);
    });

    test('with non-string keys', () => {
      const key = Symbol();
      const nonempty = { [key]: 'val' };
      assert(Object_matches(nonempty, clone(nonempty)));
    });

    test('function prototype instances with no hierarchy', () => {
      function Pair(left, right) {
        this.left = left;
        this.right = right;
      }
      const pair = new Pair(3, 4);
      assert(Object_matches(pair, clone(pair)));
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
      assert(Object_matches(object, clone(object)));
    });

    test('ES6 class instances with no hierarchy', () => {
      class Pair {
        constructor(left, right) {
          this.left = left;
          this.right = right;
        }
      }
      const pair = new Pair(3, 4);
      assert(Object_matches(pair, clone(pair)));
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
      assert(Object_matches(child, clone(child)));
    });

    test('with getters', () => {
      const object = { val: 'got' };
      Object.defineProperty(object, 'getter', {
        get() { return this.val; }
      });
      const cloned = clone(object);
      assert(Object_matches(object, cloned));
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
