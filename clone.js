
module.exports = { };

// Copy properties from `source` to `result`
function mirror(source, result, clone) {
  const descriptors = Object.getOwnPropertyDescriptors(source);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = descriptors[key];
    if (descriptor.get || descriptor.set) {
      Object.defineProperty(result, key, descriptor);
    } else {
      const cloned_value = clone(descriptor.value);
      Object.defineProperty(result, key, { ...descriptor, value: cloned_value });
    }
  }
}

// NOTE TO FUTURE SELF:
// Some of these types, such as Symbol and (primitive) boolean, seem to be resistant to property assignment.
// For instance, take the following:
//   sym = Symbol()
//   sym.prop = 'val'
// this will not fail; however,
//   sym.prop
// will be undefined rather than 'val'.
// It seems that in strict mode, an error will be thrown.
// Anyway, it may be a good thing to treat explicitly in this project.
// Include it in documentation, don't mirror() these types, and perhaps even add tests.

// --

// Some types must be handled specially
// (For instance if they have any internal slots)
// I've taken this list from the list of well-known intrinsic objects (https://tc39.es/ecma262/#sec-well-known-intrinsic-objects)
// This may be overkill, but it will probably most needed cases
const cloners = new Map();

// == BUILTIN CLONERS == //

cloners.set(Array.prototype, function(source, cache, clone) {
  const result = new Array(source.length);
  cache.set(source, result);
  mirror(source, result, clone);
  for (let i = 0; i < source.length; i++) {
    if (i in source)  // account for sparse arrays
      result[i] = clone(source[i]);
  }
  return result;
});

cloners.set(BigInt.prototype, function(source, cache, clone) {
  // BigInt objects appear to be immutable
  return source;
});

cloners.set(Boolean.prototype, function(source, cache, clone) {
  const result = new Boolean(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Date.prototype, function(source, cache, clone) {
  const result = new Date(
    source.getFullYear(),
    source.getMonth(),
    source.getDate(),
    source.getHours(),
    source.getMinutes(),
    source.getSeconds(),
    source.getMilliseconds(),
  );
  mirror(source, result, clone);
  return result;
});

cloners.set(Function.prototype, function(source, cache, clone) {
  // Functions are mutable but cannot be cloned :(
  return source;
});

cloners.set(Map.prototype, function(source, cache, clone) {
  const result = new Map();
  cache.set(source, result);
  mirror(source, result, clone);
  for (const [key, val] of source.entries()) {
    result.set(clone(key), clone(val));
  }
  return result;
});

cloners.set(Number.prototype, function(source, cache, clone) {
  const result = new Number(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Object.prototype, function(source, cache, clone) {
  const result = {};
  cache.set(source, result);
  mirror(source, result, clone);
  return result;
});

cloners.set(Promise.prototype, function(source, cache, clone) {
  // Promises do not seem to be cloneable
  const result = new Promise(source.then.bind(source));
  mirror(source, result, clone);
  return result;
});

cloners.set(RegExp.prototype, function(source, cache, clone) {
  const result = new RegExp(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Set.prototype, function(source, cache, clone) {
  const result = new Set();
  cache.set(source, result);
  mirror(source, result, clone);
  for (const val of source) {
    result.add(clone(val));
  }
  return result;
});

cloners.set(String.prototype, function(source, cache, clone) {
  const result = new String(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Symbol.prototype, function(source, cache, clone) {
  // Symbols are immutable: https://tc39.es/ecma262/#sec-ecmascript-language-types-symbol-type
  return source;
});

cloners.set(WeakMap.prototype, function(source, cache, clone) {
  // WeakMaps cannot be cloned :(
  return source;
});

cloners.set(WeakSet.prototype, function(source, cache, clone) {
  //WeakSets cannot be cloned :(
  return source;
});

// == TYPED ARRAYS ET AL == //

cloners.set(ArrayBuffer.prototype, function(source, cache, clone) {
  const result = source.slice();
  mirror(source, result, clone);
  return result;
});

cloners.set(SharedArrayBuffer.prototype, function(source, cache, clone) {
  const result = source.slice();
  mirror(source, result, clone);
  return result;
});

cloners.set(DataView.prototype, function(source, cache, clone) {
  const result = new DataView(clone(source.buffer), source.byteOffset, source.byteLength);
  mirror(source, result, clone);
  return result;
});

cloners.set(BigInt64Array.prototype, function(source, cache, clone) {
  const result = new BigInt64Array(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(BigUint64Array.prototype, function(source, cache, clone) {
  const result = new BigUint64Array(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Float32Array.prototype, function(source, cache, clone) {
  const result = new Float32Array(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Float64Array.prototype, function(source, cache, clone) {
  const result = new Float64Array(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Int8Array.prototype, function(source, cache, clone) {
  const result = new Int8Array(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Int16Array.prototype, function(source, cache, clone) {
  const result = new Int16Array(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Int32Array.prototype, function(source, cache, clone) {
  const result = new Int32Array(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Uint8Array.prototype, function(source, cache, clone) {
  const result = new Uint8Array(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Uint8ClampedArray.prototype, function(source, cache, clone) {
  const result = new Uint8ClampedArray(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Uint16Array.prototype, function(source, cache, clone) {
  const result = new Uint16Array(source);
  mirror(source, result, clone);
  return result;
});

cloners.set(Uint32Array.prototype, function(source, cache, clone) {
  const result = new Uint32Array(source);
  mirror(source, result, clone);
  return result;
});

// == ERRORS == //

cloners.set(Error.prototype, function(source, cache, clone) {
  const result = new Error(source.message, source.fileName, source.lineNumber);
  mirror(source, result, clone);
  return result;
});

cloners.set(EvalError.prototype, function(source, cache, clone) {
  const result = new EvalError(source.message, source.fileName, source.lineNumber);
  mirror(source, result, clone);
  return result;
});

cloners.set(RangeError.prototype, function(source, cache, clone) {
  const result = new RangeError(source.message, source.fileName, source.lineNumber);
  mirror(source, result, clone);
  return result;
});

cloners.set(ReferenceError.prototype, function(source, cache, clone) {
  const result = new ReferenceError(source.message, source.fileName, source.lineNumber);
  mirror(source, result, clone);
  return result;
});

cloners.set(SyntaxError.prototype, function(source, cache, clone) {
  const result = new SyntaxError(source.message, source.fileName, source.lineNumber);
  mirror(source, result, clone);
  return result;
});

cloners.set(TypeError.prototype, function(source, cache, clone) {
  const result = new TypeError(source.message, source.fileName, source.lineNumber);
  mirror(source, result, clone);
  return result;
});

cloners.set(URIError.prototype, function(source, cache, clone) {
  const result = new URIError(source.message, source.fileName, source.lineNumber);
  mirror(source, result, clone);
  return result;
});

const custom_clone = Symbol();
module.exports.customClone = custom_clone;
module.exports.custom_clone = custom_clone;

module.exports.clone =
function outer_clone(source) {

  // We want to preserve correct structure in objects with tricky references,
  // e.g. cyclic structures or structures with two references to the same object.
  // To do this, we'll cache the results of this function during this invokation,
  // and return from this cache when possible.
  // Note that we only store certiain values, like Arrays or plain object
  const cache = new WeakMap();

  return clone(source);

  // Actual algorithm implementation
  function clone(source) {

    if (
      source === null
      || source === undefined
      || typeof source === 'boolean'
      || typeof source === 'number'
      || typeof source === 'string'
    ) {
      return source;
    }

    // return early on cache hit
    if (cache.has(source)) {
      return cache.get(source);
    }

    // Allow for custom cloning
    if (source[custom_clone]) {
      return source[custom_clone]();
    }

    const prototype = Object.getPrototypeOf(source);
    if (cloners.has(prototype)) {
      const cloner = cloners.get(prototype);
      return cloner(source, cache, clone);
    } else {  // custom type
      const result = Object.create(prototype);
      cache.set(source, result);
      mirror(source, result, clone);
      return result;
    }

  }

}

