## Comparison

Comparison of running a test suite defined in `tests.js` on different packages.
See `compare.js`.

| package \ feature             | primitives | native types | prototypes | monkeypatching | cycles | diamonds | getters & setters |
| ----------------------------- | ---------- | ------------ | ---------- | -------------- | ------ | -------- | ----------------- |
| `true-clone` 0.5.6            | ✓          | ✓            | ✓          | ✓              | ✓      | ✓        | ✓                 |
| [`clone`][1] 2.1.2            | ✓          | / (1)        | ✓          | ✓              | ✓      | ✓        | ✗                 |
| [`lodash.clonedeep`][2] 4.5.0 | ✓          | / (2)        | ✓          | / (3)          | / (4)  | ✓        | ✗                 |

Key
- *✓*: supported
- *✗*: unsupported
- */*: partial support

Definitions
- *primitives*: supports primitive values
- *native types*: supports certain native types such as `Array` and `Set`
- *prototypes*: supports objects with prototypes
- *monkeypatching*: copies over monkeypatched attributes (e.g. `const ar = []; ar.my = 'prop'; console.assert(clone(ar).my === 'prop')`
- *cycles*: support cyclic data
- *diamonds*: supports diamond-shaped data (e.g. `const child = { i_am: 'child' }; const parent = { child_a: child, child_b: child };`)
- *getters & setters*: supports getters and setters

Footnotes
- (1): fails for `Number`, `String`, `ArrayBuffer`, `DataView`, and typed arrays.
- (2): fails for `BigInt64Array` and `BigUint64Array` as well as error types
- (3): fails for the `Array` type
- (4): fails for the `Map` and `Set` types

[1]: https://github.com/pvorb/clone
[2]: https://www.npmjs.com/package/lodash.clonedeep

