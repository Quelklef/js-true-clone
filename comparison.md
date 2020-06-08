## Feature Comparison

Comparison of running a test suite defined in `tests.js` on different packages. See `compare.sh`.

| package \ feature             | primitives | native types | prototypes | monkeypatching | relations | rich properites |
| ----------------------------- | ---------- | ------------ | ---------- | -------------- | --------- | --------------- |
| `true-clone` 0.5.6            | ![s]       | ![s]         | ![s]       | ![s]           | ![s]      | ![s]            |
| [`clone`][1] 2.1.2            | ![s]       | ![p] (1)     | ![s]       | ![p] (1)       | ![s]      | ![u]            |
| [`lodash.clonedeep`][2] 4.5.0 | ![s]       | ![p] (2)     | ![s]       | ![p] (3)       | ![p] (4)  | ![u]            |

![s]: all tests passing; ![u]: no tests passing; ![p]: some tests passing

[s]: https://via.placeholder.com/15/0d0?text=+
[u]: https://via.placeholder.com/15/d00?text=+
[p]: https://via.placeholder.com/15/fc1?text=+

[1]: https://github.com/pvorb/clone
[2]: https://www.npmjs.com/package/lodash.clonedeep

- (1): fails for `Number`, `String`, `ArrayBuffer`, `DataView`, errors types, and typed arrays.
- (2): fails for sparse arrays, `BigInt64Array`, `BigUint64Array`, and error types
- (3): fails for `Array`, `BigInt64Array`, `BigUint64Array`, and error types
- (4): fails for cyclic `Map` and `Set` objects

Definitions
- **primitives**: supports primitive values
- **native types**: supports certain native types such as `Array` and `Set`
- **prototypes**: supports objects with prototypes
- **monkeypatching**: copies over monkeypatched attributes
  - e.g. `const ar = []; ar.my = 'prop'; console.assert(clone(ar).my === 'prop')`
- **relations**: preserves relational identity, such as in cyclic and diamond-shaped structures
  - *cyclic* e.g. e.g. `const ar = []; ar.push(ar);`
  - *diamonds* e.g. `const child = { i_am: 'child' }; const parent = { child_a: child, child_b: child };`
- **rich properties**: getters and setters etc.

## Benchmarks

See `benchmark.js`

| package \ scope (in 1k ops/s) | primitives | plain objects | rich objects |
| ----------------------------- | ---------- | ------------- | ------------ |
| `true-clone` 0.5.6            | 1503       | 117           | 170          |
| [`clone`][1] 2.1.2            | 2053       | 236           | 294          |
| [`lodash.clonedeep`][2] 4.5.0 | 6419       | 458           | 1021         |
