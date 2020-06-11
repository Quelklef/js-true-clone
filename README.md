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
const cloned = clone(my_object);
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

Additionally, custom cloning algorithms are supported if needed; see the *Custom cloning* section.

## Versioning

The *official* API for this package is to provide a cloning algorithm with perfect behaviour.
All imperfect behaviour, even if documented, is *not* a part of the API and should *not* be relied on.
Updates to this package will thus almost always be either minor- or patch-level updates.

## Caveats

Where *caveat* means incorrect behaviour due to JS limitations.

- **`Function`, `WeakSet`, `WeakMap`**: Objects of these types will *not* be cloned and will instead be returned as-is.

- **`Proxy`**: Proxies will not be detected and will not be preserved while cloning.

## Gotchas

Where *gotcha* means behaviour that isn't wrong but may be surprising or undesirable.

<details>
<summary><b>Monkeypatching methods</b>: cloning an object with monkeypatched methods can cause surprising behaviour if the method has been eagerly bound.</summary>

```js
const list = ['i', 'am'];

// Monkeypatch .toString() to include brackets
const old_toString = Array.prototype.toString.bind(list);
list.toString = () => '[' + old_toString() + ']';

// Works OK
list.push('error');
console.assert(list.toString() === '[i,am,error]');

// Now try cloning it
const { clone } = require('true-clone');
const cloned = clone(list);

// Oh no!
cloned.push('room');
console.assert(cloned.toString() === '[i,am,error]');
```

The issue is that `cloned.toString` shadows `old_toString` which is still boud to `list`.
Thus, calling `cloned.toString` will render the contents of `list`, not `cloned`.

The easiest fix for this is to wait for the `this` argument within the moneypatched call, for instance by replacing
```js
const old_toString = Array.prototype.toString.bind(list);
list.toString = () => '[' + old_toString() + ']';
```
with
```js
list.toString = function() {
  const old_toString = Array.prototype.toString.bind(this);
  return '[' + old_toString() + ']';
}
```
or with
```js
list.toString = function() {
  return '[' + Array.prototype.toString.call(this) + ']';
}
```

Another fix is to use prototyping instead of monkeypatching.
</details>

## Comparison

Suite in `tests.js` run on different packages using node v14.2.0. See `compare.sh`.

| package \ feature             | primitives | native types | prototypes | monkeypatching | relations   | rich properites |
| ----------------------------- | ---------- | ------------ | ---------- | -------------- | ----------- | --------------- |
| `true-clone` 0.7.7            | ![s]       | ![s]         | ![s]       | ![s]           | ![s]        | ![s]            |
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

| package \ scope               | primitives     | native object types | plain objects | rich objects |
| ----------------------------- | -------------- | ------------------- | ------------- | ------------ |
| `true-clone` 0.7.7            | 1.622m [ops/s] | 121k                | 184k          | 255k         |
| [`clone`][1] 2.1.2            | 1.596m         | 99k                 | 229k          | 288k         |
| [`lodash.clonedeep`][2] 4.5.0 | 5.864m         | 130k                | 293k          | 948k         |
| [`rfdc`][3] 1.1.4             | 33.521m        | 1.054m              | 1.957m        | 2.636m       |

## Custom cloning

If this package is breaking on particular values, you may patch in a custom cloning function for any object or type.
Import the `customClone` symbol, then assign the `[customClone]` property of your object or prototype to the custom cloning function.

```js
const { clone, customClone } = require('true-clone');

// give a custom cloner to an object
const object = {
  [customClone]() {
    return 'sneaky!';
  }
};
console.assert(clone(object) === 'sneaky!');

// give a custom cloner to a type
class Type {
  [customClone]() {
    return 'beaky!';
  }
}
const instance = new Type();
console.assert(clone(instance) === 'beaky!');
```

This package also exports `custom_clone`, which is an alias for `customClone`.
