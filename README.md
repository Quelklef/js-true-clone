# js-true-clone

The goal of this package is to get as close as possible to a perfect JS value clone.

## Usage

```js
npm i true-clone
```

then

```js
const { clone } = require('true-clone');
// later ...
const cloned = clone(myObject);
```

## Behaviour

The cloning algorithm is pretty smart and is aware of:

- Native JS types! This includes primitives, `Array`, `Set`, `Map`, boxed primitives, typed arrays, etc.
- Prototypes! Finally, you can clone custom classes!
- Getters! These will be replicated on the result as getters, not as the computed value.
- Setters! These will be replicated on the result.
- Custom properties on native types! For instance: `const ar = []; ar.my = 'prop'; console.assert(clone(ar).my === 'prop')`.
- (Non-)enumerability, (non-)configurability, and/or (non-)writability of object properties! These will be respected.
- etc.

## Details

- Mostly works as one would expect!
- However, the following may be notable:
- Prototypes: are referenced rather than copied; `Object.is(clone(Object.create(someProto)).prototype, someProto)`
- `Proxy` objects: do not return other proxies. Additonally, all traps are ignored besides the following:
  - `getPrototypeOf`: given prototype is assigned to new object
  - `ownKeys`: these are the keys that will appear on the clone
  - `getOwnPropertyDescriptor`: is used to define properties on the clone
- Due to JS limitations, objects of the type **`Function`, `WeakSet`,** and **`WeakMap`** will *not* be cloned and will instead be returned as-is.

## Comparison

Suite in `tests.js` run on different packages using node v14.2.0. See `compare.sh`.

| package \ feature             | primitives | native types | prototypes | monkeypatching | relations   | rich properites |
| ----------------------------- | ---------- | ------------ | ---------- | -------------- | ----------- | --------------- |
| `true-clone` 0.7.9            | ![s]       | ![s]         | ![s]       | ![s]           | ![s]        | ![s]            |
| [`clone`][1] 2.1.2            | ![s]       | ![p] <sup>1  | ![s]       | ![p] <sup>1    | ![s]        | ![u]            |
| [`lodash.clonedeep`][2] 4.5.0 | ![s]       | ![p] <sup>2  | ![s]       | ![p] <sup>3    | ![p] <sup>4 | ![u]            |
| [`rfdc`][3] 1.1.4             | ![s]       | ![p] <sup>5  | ![u]       | ![u]           | ![p] <sup>6 | ![u]            |

[s]: https://via.placeholder.com/15/0d0?text=+
[u]: https://via.placeholder.com/15/d00?text=+
[p]: https://via.placeholder.com/15/fc1?text=+

[1]: https://github.com/pvorb/clone
[2]: https://www.npmjs.com/package/lodash.clonedeep
[3]: https://github.com/davidmarkclements/rfdc#readme

<details>
<summary>Key</summary>

![s]: all tests passing; ![u]: no tests passing; ![p]: some tests passing

- **primitives**: supports primitive values
- **native types**: supports certain native types such as `Array` and `Set`
- **prototypes**: supports objects with prototypes
- **monkeypatching**: copies over monkeypatched attributes
  - e.g. `const ar = []; ar.my = 'prop'; console.assert(clone(ar).my === 'prop')`
- **relations**: preserves relational identity, such as in cyclic and diamond-shaped structures
  - *cyclic* e.g. e.g. `const ar = []; ar.push(ar);`
  - *diamonds* e.g. `const child = { i_am: 'child' }; const parent = { child_a: child, child_b: child };`
- **rich properties**: getters and setters etc.
</details>

<details>
<summary>Details</summary>

- <sup>`1`</sup>: fails for `Number`, `String`, `ArrayBuffer`, `DataView`, errors types, and typed arrays.
- <sup>`2`</sup>: fails for sparse arrays, `BigInt64Array`, `BigUint64Array`, and error types
- <sup>`3`</sup>: fails for `Array`, `BigInt64Array`, `BigUint64Array`, and error types
- <sup>`4`</sup>: fails for cyclic `Map` and `Set` objects
- <sup>`5`</sup>: fails for `Number`, `String`, `Boolean`, `RegExp`, `Map`, `Set`, `ArrayBuffer`, `DataView`, typed arrays, and error types.
- <sup>`6`</sup>: fails for diamond shapes and cyclic non-`Object` values
</details>

## Benchmarks

`true-clone` pays for its correctness with speed.
Benchmark is run on my personal machine; they should be considered only in relation to each other.
See `benchmark.js`.

| package \ scope               | primitives     | native object types | plain objects | arrays |
| ----------------------------- | -------------- | ------------------- | ------------- | ------ |
| `true-clone` 0.7.9            | 2.305m [ops/s] | 337k                | 465k          | 1.281m |
| [`clone`][1] 2.1.2            | 1.943m         | 90k                 | 266k          | 257k   |
| [`lodash.clonedeep`][2] 4.5.0 | 6.132m         | 227k                | 810k          | 2.086m |
| [`rfdc`][3] 1.1.4             | 33.599m        | 969k                | 2.480m        | 2.392m |

<details>
<summary>Details</summary>

- primitives: primitive objects; test case `primitive`
- native object types: `Array`, `Map`, `Set`, and `Boolean`; test case `obj types`
- plain objects: JSON-able object; test case `Object :: plain small`
- arrays: small, dense, non-monkeypatched arrays of primitive values; test case `Array :: pure hom dense_ small`
</details>
