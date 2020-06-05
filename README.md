# js-true-clone

The goal of this package is to get as close as possible to a perfect value clone in JS, being aware of prototypes, getters & setters, etc.

### Usage

```js
npm i true-clone
```

then

```js
const { clone } = require('true-clone');
// later ...
const cloned = clone(my_object);
```

### Versioning

The *official* API for this package is to provide a cloning algorithm with perfect behaviour.
All impefect behaviour, even if documented, is *not* a part of the API and should *not* be relied on.
Updates to this package will thus almost always be either minor- or patch-level updates.

### Caveats

Javascript is a complex language, and a perfect cloning algorithm doesn't seem to be possible as this time.

- **`Function`, `Promise`, `WeakSet`, `WeakMap`**: Objects of these types will *not* be cloned and will instead be returned as-is.

- **`Proxy`**: Proxies will not be detected and will not be preserved while cloning.

### Custom cloning

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
