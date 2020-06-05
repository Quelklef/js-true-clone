
const { clone } = require('./clone.js');

function testCustomProps(get_uncloned) {
  it('with custom properties', () => {
    const uncloned = get_uncloned();
    uncloned.my = 'prop';
    const cloned = clone(uncloned);
    expect(cloned).toStrictEqual(uncloned);
    expect(cloned).not.toBe(uncloned);
    expect(cloned.my).toStrictEqual(uncloned.my);
    cloned.my = 'different';
    expect(cloned.my).not.toStrictEqual(uncloned.my);
  });
}

function testTypedArray(constructor, sample_value) {
  it('empty', () => {
    const array = new constructor(100);
    const array_c = clone(array);
    expect(array_c).toStrictEqual(array);
    expect(array_c).not.toBe(array);
  });

  it('nonempty', () => {
    const array = new constructor(100);
    array[0] = sample_value;
    const array_c = clone(array);
    expect(array_c).toStrictEqual(array);
    expect(array_c).not.toBe(array);
  });

  testCustomProps(() => {
    const array = new constructor(100);
    array[0] = sample_value;
    return array;
  });
}

describe('true clone', () => {

  describe('primitives', () => {

    it('null', () => {
      expect(clone(null)).toBe(null);
    });

    it('undefined', () => {
      expect(clone(undefined)).toBe(undefined);
    });

    it('nice numbers', () => {
      expect(clone(1)).toBe(1);
      expect(clone(-1)).toBe(-1);
      expect(clone(3.75)).toBe(3.75);
    });

    it('+/- infinity', () => {
      expect(clone(Number.INFINITY)).toBe(Number.INFINITY);
      expect(clone(Number.NEGATIVE_INFINITY)).toBe(Number.NEGATIVE_INFINITY);
    });

    it('NaN', () => {
      expect(clone(Number.NaN)).toBe(Number.NaN);
    });

    it('strings', () => {
      expect(clone('')).toBe('');
      expect(clone('string')).toBe('string');
    });

    it('booleans', () => {
      expect(clone(false)).toBe(false);
      expect(clone(true)).toBe(true);
    });

  });

  describe('special types', () => {

    describe('Array', () => {

      it('empty', () => {
        const empty = [];
        const empty_c = clone(empty);
        expect(empty_c).toStrictEqual(empty);
        expect(empty_c).not.toBe(empty);
      });

      it('nonempty', () => {
        const nonempty = [1, 2, 3];
        const nonempty_c = clone(nonempty);
        expect(nonempty_c).toStrictEqual(nonempty);
        expect(nonempty_c).not.toBe(nonempty);
      });

      it('nested', () => {
        const nested = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        const nested_c = clone(nested);
        expect(nested_c).toStrictEqual(nested);
        expect(nested_c).not.toBe(nested);
        for (let i = 0; i < nested.length; i++)
          expect(nested_c[i]).not.toBe(nested[i]);
      });

      testCustomProps(() => [3, 1, 4]);

      it('with self-reference', () => {
        const array = [0, 1, 2];
        array[1] = array;
        const array_c = clone(array);
        expect(array_c).toStrictEqual(array);
        expect(Object.is(array_c[1], array_c)).toBe(true);
      });

    });

    it('ArrayBuffer', () => { });

    it('BigInt', () => {
      expect(clone(0n)).toStrictEqual(0n);
      expect(clone(100n)).toStrictEqual(100n);
      expect(clone(-100n)).toStrictEqual(-100n);
    });

    describe('BigInt64Array', () => {
      testTypedArray(BigInt64Array, 12n);
    });

    describe('BigUint64Array', () => {
      testTypedArray(BigUint64Array, 12n);
    });

    it('Boolean', () => { });

    it('DataView', () => { });

    it('Date', () => { });

    describe('Float32Array', () => {
      testTypedArray(Float32Array, 3.14);
    });

    describe('Float64Array', () => {
      testTypedArray(Float64Array, 3.14);
    });

    it('Function', () => {
      const f = () => {};
      expect(clone(f)).toBe(f);
    });

    describe('Int8Array', () => {
      testTypedArray(Int8Array, 12);
    });

    describe('Int16Array', () => {
      testTypedArray(Int16Array, 12);
    });

    describe('Int32Array', () => {
      testTypedArray(Int32Array, 12);
    });

    describe('Map', () => {
      it('nonempty', () => {
        const map = new Map();
        map.set([], 'empty');
        map.set([1, 2, 3], 'counting')
        const map_c = clone(map);
        expect(map_c).toStrictEqual(map);
        expect(map_c).not.toBe(map);
      });

      testCustomProps(() => {
        const custom = new Map();
        custom.set('ping', 'pong');
        return custom;
      });
    });

    describe('Number', () => {
      it('simple', () => {
        const number = new Number(3.14);
        number.my = 'prop';
        const number_c = clone(number);
        expect(+number_c).toBe(3.14);
        expect(Object.is(number_c, number)).toBe(false);
      });

      testCustomProps(() => new Number(3.14));
    });

    it('Promise', () => { });

    it('Proxy', () => { });

    it('RegExp', () => { });

    describe('Set', () => {
      test('simple', () => {
        const set = new Set([1, 2, 3]);
        const set_c = clone(set);
        expect(set_c).toStrictEqual(set);
        expect(set_c).not.toBe(set);
      });

      test('with self-reference', () => {
        const set = new Set([1, 2, 3]);
        set.add(set);
        const set_c = clone(set);
        expect(set_c).toStrictEqual(set);
        expect(set_c).not.toBe(set);
        expect(set_c.has(set_c)).toBe(true);
        expect(set_c.has(set)).toBe(false);
      });

      testCustomProps(() => new Set([1, 2, 3]));
    });

    it('SharedArrayBuffer', () => { });

    describe('String', () => {
      it('simple', () => {
        const string = new String('string');
        const string_c = clone(string);
        expect(string_c).toStrictEqual(string);
        expect(string_c).not.toBe(string);
      });

      testCustomProps(() => new String('imastring'));
    });

    it('Symbol', () => {
      const s = Symbol('s');
      expect(clone(s)).toBe(s);
    });

    describe('Uint8Array', () => {
      testTypedArray(Uint8Array, 12);
    });

    describe('Uint8ClampedArray', () => {
      testTypedArray(Uint8ClampedArray, 12);
    });

    describe('Uint16Array', () => {
      testTypedArray(Uint16Array, 12);
    });

    describe('Uint32Array', () => {
      testTypedArray(Uint32Array, 12);
    });

    it('Error', () => { });

    it('EvalError', () => { });

    it('RangeError', () => { });

    it('ReferenceError', () => { });

    it('SyntaxError', () => { });

    it('TypeError', () => { });

    it('URIError', () => { });

  });

  describe('plain and custom objects', () => {

    it('emtpy', () => {
      const empty = {};
      const empty_c = clone(empty);
      expect(empty_c).toStrictEqual(empty);
      expect(empty_c).not.toBe(empty);
    });

    it('nonempty', () => {
      const nonempty = { left: 'right', up: 'down', red: 'blue' };
      const nonempty_c = clone(nonempty);
      expect(nonempty_c).toStrictEqual(nonempty);
      expect(nonempty_c).not.toBe(nonempty);
    });

    it('nested', () => {
      const nested = { child: { val: 'val!' } };
      const nested_c = clone(nested);
      expect(nested_c).toStrictEqual(nested);
      expect(nested_c).not.toBe(nested);
      expect(nested_c.child).not.toBe(nested.child);
    });

    it('with non-string keys', () => {
      const sym = Symbol();
      const funky = { [sym]: 'sym', str: 'str' };
      const funky_c = clone(funky);
      expect(funky_c).toStrictEqual(funky);
    });

    it('with cycles', () => {
      const object = { prop: 'val' };
      object.self = object;
      const object_c = clone(object);
      expect(object_c).toStrictEqual(object);
      expect(Object.is(object_c.self, object_c)).toBe(true);
    });

    it('with tricky reference structures', () => {
      const target = { i_am: 'target' };
      const object = { first_ref: target, second_ref: target };
      const object_c = clone(object);
      expect(Object.is(object_c.first_ref, object_c.second_ref)).toBe(true);
    });

    it('function prototype instances with no hierarchy', () => {
      function Pair(left, right) {
        this.left = left;
        this.right = right;
      }
      const pair = new Pair(3, 4);
      const pair_c = clone(pair);
      expect(pair_c).toStrictEqual(pair);
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
      const object_c = clone(object);
      expect(object_c).toStrictEqual(object);
      expect(object_c.toString()).toStrictEqual('1, 2, 3');
    });

    it('ES6 class instances with no hierarchy', () => {
      class Pair {
        constructor(left, right) {
          this.left = left;
          this.right = right;
        }
      }
      const pair = new Pair(3, 4);
      const pair_c = clone(pair);
      expect(pair_c).toStrictEqual(pair);
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
      const child_c = clone(child);
      expect(child_c).toStrictEqual(child);
    });

    it('with getters', () => {
      const obj = {};
      Object.defineProperty(obj, 'getter', {
        get() { return 'got'; }
      });
      const obj_c = clone(obj);
      expect(obj_c).toStrictEqual(obj);
      expect(obj_c.getter).toBe('got');
    });

  });

});
