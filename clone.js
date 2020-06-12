
module.exports = { };

// Copy properties from `source` to `result`
function mirror(source, result, cache) {
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (descriptor.get || descriptor.set) {
      Object.defineProperty(result, key, descriptor);
    } else {
      const cloned_value = clone(descriptor.value, cache);
      Object.defineProperty(result, key, { ...descriptor, value: cloned_value });
    }
  }
}

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

  return clone(source, cache);
  
}

// Actual algorithm implementation
function clone(source, cache) {

  // Return primitive and Function values directly
  if (source === null || typeof source !== 'object') {
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

  switch (prototype) {

    default: {
      // Likely a user-defined type
      const result = Object.create(prototype);
      cache.set(source, result);
      mirror(source, result, cache);
      return result;
    }
    
    // Some types must be handled specially
    // (For instance if they have any internal slots)
    // I've taken this list from the list of well-known intrinsic objects (https://tc39.es/ecma262/#sec-well-known-intrinsic-objects)
    // This may be overkill, but it will probably most needed cases
    
    case Array.prototype: {

      const result = [];
      cache.set(source, result);

      const keys = Reflect.ownKeys(source);

      // We'll assume the array is well-behaved (dense and not monkeypatched)
      // If that turns out to be false, we'll fallback to generic code

      well_behaved: {

        let i;
        for (i = 0; i < source.length; i++) {
          if (i in source) {
            result.push(clone(source[i], cache));
          } else {
            // Array is sparse
            break well_behaved;
          }
        }


        if (i !== keys.length - 1) {
          // Array is monkeypatched
          break well_behaved;
        }

        return result;

      }

      // Generic fallback
      result.length = 0;
      mirror(source, result, cache);
      return result;

    }

    case Boolean.prototype: {
      const result = new Boolean(source);
      mirror(source, result, cache);
      return result;
    }

    case Date.prototype: {
      const result = new Date(
        source.getFullYear(),
        source.getMonth(),
        source.getDate(),
        source.getHours(),
        source.getMinutes(),
        source.getSeconds(),
        source.getMilliseconds(),
      );
      mirror(source, result, cache);
      return result;
    }

    case Map.prototype: {
      const result = new Map();
      cache.set(source, result);
      mirror(source, result, cache);
      for (const [key, val] of source.entries()) {
        result.set(clone(key, cache), clone(val, cache));
      }
      return result;
    }

    case Number.prototype: {
      const result = new Number(source);
      mirror(source, result, cache);
      return result;
    }

    case Object.prototype: {
      const result = {};
      cache.set(source, result);
      mirror(source, result, cache);
      return result;
    }

    case Promise.prototype: {
      const result = new Promise(source.then.bind(source));
      mirror(source, result, cache);
      return result;
    }

    case RegExp.prototype: {
      const result = new RegExp(source);
      mirror(source, result, cache);
      return result;
    }

    case Set.prototype: {
      const result = new Set();
      cache.set(source, result);
      mirror(source, result, cache);
      for (const val of source) {
        result.add(clone(val, cache));
      }
      return result;
    }

    case String.prototype: {
      const result = new String(source);
      mirror(source, result, cache);
      return result;
    }

    case WeakMap.prototype: {
      // WeakMaps cannot be cloned :(
      return source;
    }

    case WeakSet.prototype: {
      //WeakSets cannot be cloned :(
      return source;
    }

    // == TYPED ARRAYS ET AL == //

    case ArrayBuffer.prototype: {
      const result = source.slice();
      mirror(source, result, cache);
      return result;
    }

    case SharedArrayBuffer.prototype: {
      const result = source.slice();
      mirror(source, result, cache);
      return result;
    }

    case DataView.prototype: {
      const result = new DataView(clone(source.buffer, cache), source.byteOffset, source.byteLength);
      mirror(source, result, cache);
      return result;
    }

    case BigInt64Array.prototype: {
      const result = new BigInt64Array(source);
      mirror(source, result, cache);
      return result;
    }

    case BigUint64Array.prototype: {
      const result = new BigUint64Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Float32Array.prototype: {
      const result = new Float32Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Float64Array.prototype: {
      const result = new Float64Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Int8Array.prototype: {
      const result = new Int8Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Int16Array.prototype: {
      const result = new Int16Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Int32Array.prototype: {
      const result = new Int32Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Uint8Array.prototype: {
      const result = new Uint8Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Uint8ClampedArray.prototype: {
      const result = new Uint8ClampedArray(source);
      mirror(source, result, cache);
      return result;
    }

    case Uint16Array.prototype: {
      const result = new Uint16Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Uint32Array.prototype: {
      const result = new Uint32Array(source);
      mirror(source, result, cache);
      return result;
    }

    // == ERRORS == //

    case Error.prototype: {
      const result = new Error(source.message, source.fileName, source.lineNumber);
      mirror(source, result, cache);
      return result;
    }

    case EvalError.prototype: {
      const result = new EvalError(source.message, source.fileName, source.lineNumber);
      mirror(source, result, cache);
      return result;
    }

    case RangeError.prototype: {
      const result = new RangeError(source.message, source.fileName, source.lineNumber);
      mirror(source, result, cache);
      return result;
    }

    case ReferenceError.prototype: {
      const result = new ReferenceError(source.message, source.fileName, source.lineNumber);
      mirror(source, result, cache);
      return result;
    }

    case SyntaxError.prototype: {
      const result = new SyntaxError(source.message, source.fileName, source.lineNumber);
      mirror(source, result, cache);
      return result;
    }

    case TypeError.prototype: {
      const result = new TypeError(source.message, source.fileName, source.lineNumber);
      mirror(source, result, cache);
      return result;
    }

    case URIError.prototype: {
      const result = new URIError(source.message, source.fileName, source.lineNumber);
      mirror(source, result, cache);
      return result;
    }

  }
  
}

