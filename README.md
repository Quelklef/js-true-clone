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
All impefect behaviour, even if documented, is *not* a part of the API and should *not* be relied on.
Updates to this package will thus almost always be either minor- or patch-level updates.

## Caveats

Where *caveat* means incorrect behaviour due to JS limitations.

- **`Function`, `Promise`, `WeakSet`, `WeakMap`**: Objects of these types will *not* be cloned and will instead be returned as-is.

- **`Proxy`**: Proxies will not be detected and will not be preserved while cloning.

## Gotchas

Where *gotcha* means behaviour that isn't wrong but may be surprising or undesirable.

- **Monkeypatching methods**: Cloning bound functions can cause some undesirable behaviour relating to monkeypatching methods:

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
