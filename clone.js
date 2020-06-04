
module.exports = { clone };

function clone(source) {

  // We want to preserve correct structure in objects with tricky references,
  // e.g. cyclic structures or structures with two references to the same object.
  // To do this, we'll cache the results of this function during this invokation,
  // and return from this cache when possible.
  // Note that we only store certiain values, like Arrays or plain object
  const cache = new WeakMap();

  return inner(source);

  // Actual algorithm implementation
  function inner(source) {

    // non-objects and null are immutable and may be returned as-is
    if (typeof source !== 'object' || source === null) {
      return source;
    }

    // return early on cache hit
    if (cache.has(source))
      return cache.get(source);

    // handle arrays
    if (source instanceof Array) {

      const result = new Array(source.length);
      cache.set(source, result);
      for (let i = 0; i < source.length; i++) {
        result[i] = inner(source[i]);
      }
      return result;

    // handle maps
    } else if (source instanceof Map) {

      const result = new Map();
      cache.set(source, result);
      for (const [key, val] of source.entries()) {
        result.set(key, val);
      }
      return result;

    // handle plain objects
    } else {

      const result = Object.create(Object.getPrototypeOf(source));
      cache.set(source, result);

      const descriptors = Object.getOwnPropertyDescriptors(source);
      for (const key of Reflect.ownKeys(source)) {
        const descriptor = descriptors[key];
        if (descriptor.get || descriptor.set) {
          Object.defineProperty(result, key, descriptor);
        } else {
          const cloned_value = inner(descriptor.value);
          Object.defineProperty(result, key, { ...descriptor, value: cloned_value });
        }
      }
      return result;

    }

  }

}

