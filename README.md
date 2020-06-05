# js-true-clone

The goal of this package is to get as close as possible to a perfect value clone in JS, being aware of prototypes, getters & setters, etc.

### Usage

```js
npm i true-clone
```

then

```js
const { clone } = require('true-clone');
# later ...
const cloned = clone(my_object);
```

### Versioning

The *official* API for this package is to provide a cloning algorithm with perfect behaviour.
All impefect behaviour, even if documented, is *not* a part of the API and should *not* be relied on.
All updates to this package will be either minor- or patch-level updates.

### Caveats

Javascript is a complex language, and a perfect cloning algorithm doesn't seem to be possible as this time.

**`Function`, `Promise`, `WeakSet`, `WeakMap`**: Objects of these types will *not* be cloned and will instead be returned as-is.

**`Proxy`**: Proxies will not be detected and will not be preserved while cloning.



