
const { clone } = require('./clone.js');

describe('true clone', () => {

  it('handles null', () => {
    expect(clone(null)).toBe(null);
  });

  it('handles undefined', () => {
    expect(clone(undefined)).toBe(undefined);
  });

  it('handles symbols', () => {
    const s = Symbol('s');
    expect(clone(s)).toBe(s);
  });

  it('handles nice numbers', () => {
    expect(clone(1)).toBe(1);
    expect(clone(-1)).toBe(-1);
    expect(clone(3.75)).toBe(3.75);
  });

  it('handles +/- infinity', () => {
    expect(clone(Number.INFINITY)).toBe(Number.INFINITY);
    expect(clone(Number.NEGATIVE_INFINITY)).toBe(Number.NEGATIVE_INFINITY);
  });

  it('handles NaN', () => {
    expect(clone(Number.NaN)).toBe(Number.NaN);
  });

  it('handles big ints', () => {
    expect(clone(0n)).toEqual(0n);
    expect(clone(100n)).toEqual(100n);
    expect(clone(-100n)).toEqual(-100n);
  });

  it('handles strings', () => {
    expect(clone('')).toBe('');
    expect(clone('string')).toBe('string');
  });

  it('handles booleans', () => {
    expect(clone(false)).toBe(false);
    expect(clone(true)).toBe(true);
  });

  it('handles functions', () => {
    const f = () => {};
    expect(clone(f)).toBe(f);
  });

  it('handles arrays', () => {
    const empty = [];
    const empty_c = clone(empty);
    expect(empty_c).toEqual(empty);
    expect(empty_c).not.toBe(empty);

    const nonempty = [1, 2, 3];
    const nonempty_c = clone(nonempty);
    expect(nonempty_c).toEqual(nonempty);
    expect(nonempty_c).not.toBe(nonempty);

    const nested = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const nested_c = clone(nested);
    expect(nested_c).toEqual(nested);
    expect(nested_c).not.toBe(nested);
    for (let i = 0; i < nested.length; i++)
      expect(nested_c[i]).not.toBe(nested[i]);
  });

  it('handles simple objects', () => {
    const empty = {};
    const empty_c = clone(empty);
    expect(empty_c).toEqual(empty);
    expect(empty_c).not.toBe(empty);

    const nonempty = { left: 'right', up: 'down', red: 'blue' };
    const nonempty_c = clone(nonempty);
    expect(nonempty_c).toEqual(nonempty);
    expect(nonempty_c).not.toBe(nonempty);

    const nested = { child: { val: 'val!' } };
    const nested_c = clone(nested);
    expect(nested_c).toEqual(nested);
    expect(nested_c).not.toBe(nested);
    expect(nested_c.child).not.toBe(nested.child);
  });

});
