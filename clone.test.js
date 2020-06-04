
const { clone } = require('./clone.js');

describe('true clone', () => {

  describe('primitives', () => {

    it('null', () => {
      expect(clone(null)).toBe(null);
    });

    it('undefined', () => {
      expect(clone(undefined)).toBe(undefined);
    });

    it('symbols', () => {
      const s = Symbol('s');
      expect(clone(s)).toBe(s);
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

    it('BigInt', () => {
      expect(clone(0n)).toStrictEqual(0n);
      expect(clone(100n)).toStrictEqual(100n);
      expect(clone(-100n)).toStrictEqual(-100n);
    });

    describe('Number', () => {
      const number = new Number(3.14);
      number.my = 'prop';
      const number_c = clone(number);
      expect(+number_c).toBe(3.14);
      expect(number_c.my).toBe('prop');
      expect(Object.is(number_c, number)).toBe(false);
    });

    it('Function', () => {
      const f = () => {};
      expect(clone(f)).toBe(f);
    });

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

      it('with custom properties', () => {
        const custom = [3, 1, 4];
        custom.my = 'prop';
        const custom_c = clone(custom);
        expect(custom_c).toStrictEqual(custom);
        expect(custom_c).not.toBe(custom);
        expect(custom_c.my).toStrictEqual(custom.my);
      });

      it('with self-reference', () => {
        const array = [0, 1, 2];
        array[1] = array;
        const array_c = clone(array);
        expect(array_c).toStrictEqual(array);
        expect(Object.is(array_c[1], array_c)).toBe(true);
      });

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

      it('with custom properties', () => {
        const custom = new Map();
        custom.set('ping', 'pong');
        custom.my = 'prop';
        const custom_c = clone(custom);
        expect(custom_c).toStrictEqual(custom);
        expect(custom_c).not.toBe(custom);
        expect(custom_c.my).toStrictEqual(custom.my);
      });

    });

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
