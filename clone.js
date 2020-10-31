
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
  if (typeof source !== 'object' || source === null) {
    return source;
  }

  // return early on cache hit
  if (cache.has(source)) {
    return cache.get(source);
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

    case Map_prototype: {
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

    case null: {
      const result = Object.create(null);
      cache.set(source, result);
      mirror(source, result, cache);
      return result;
    }

    case Promise_prototype: {
      const result = new Promise(source.then.bind(source));
      mirror(source, result, cache);
      return result;
    }

    case RegExp.prototype: {
      const result = new RegExp(source);
      mirror(source, result, cache);
      return result;
    }

    case Set_prototype: {
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

    case WeakMap_prototype: {
      // WeakMaps cannot be cloned :(
      return source;
    }

    case WeakSet_prototype: {
      //WeakSets cannot be cloned :(
      return source;
    }

    // == TYPED ARRAYS ET AL == //

    case ArrayBuffer_prototype: {
      const result = source.slice();
      mirror(source, result, cache);
      return result;
    }

    case SharedArrayBuffer_prototype: {
      const result = source.slice();
      mirror(source, result, cache);
      return result;
    }

    case DataView_prototype: {
      const result = new DataView(clone(source.buffer, cache), source.byteOffset, source.byteLength);
      mirror(source, result, cache);
      return result;
    }

    case BigInt64Array_prototype: {
      const result = new BigInt64Array(source);
      mirror(source, result, cache);
      return result;
    }

    case BigUint64Array_prototype: {
      const result = new BigUint64Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Float32Array_prototype: {
      const result = new Float32Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Float64Array_prototype: {
      const result = new Float64Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Int8Array_prototype: {
      const result = new Int8Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Int16Array_prototype: {
      const result = new Int16Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Int32Array_prototype: {
      const result = new Int32Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Uint8Array_prototype: {
      const result = new Uint8Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Uint8ClampedArray_prototype: {
      const result = new Uint8ClampedArray(source);
      mirror(source, result, cache);
      return result;
    }

    case Uint16Array_prototype: {
      const result = new Uint16Array(source);
      mirror(source, result, cache);
      return result;
    }

    case Uint32Array_prototype: {
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

const Promise_prototype           = typeof Promise           !== 'undefined' ? Promise.prototype           : undefined;

const Map_prototype               = typeof Map               !== 'undefined' ? Map.prototype               : undefined;
const Set_prototype               = typeof Set               !== 'undefined' ? Set.prototype               : undefined;
const WeakMap_prototype           = typeof WeakMap           !== 'undefined' ? WeakMap.prototype           : undefined;
const WeakSet_prototype           = typeof WeakSet           !== 'undefined' ? WeakSet.prototype           : undefined;

const ArrayBuffer_prototype       = typeof ArrayBuffer       !== 'undefined' ? ArrayBuffer.prototype       : undefined;
const SharedArrayBuffer_prototype = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer.prototype : undefined;
const DataView_prototype          = typeof DataView          !== 'undefined' ? DataView.prototype          : undefined;
const BigInt64Array_prototype     = typeof BigInt64Array     !== 'undefined' ? BigInt64Array.prototype     : undefined;
const BigUint64Array_prototype    = typeof BigUint64Array    !== 'undefined' ? BigUint64Array.prototype    : undefined;
const Float32Array_prototype      = typeof Float32Array      !== 'undefined' ? Float32Array.prototype      : undefined;
const Float64Array_prototype      = typeof Float64Array      !== 'undefined' ? Float64Array.prototype      : undefined;
const Int8Array_prototype         = typeof Int8Array         !== 'undefined' ? Int8Array.prototype         : undefined;
const Int16Array_prototype        = typeof Int16Array        !== 'undefined' ? Int16Array.prototype        : undefined;
const Int32Array_prototype        = typeof Int32Array        !== 'undefined' ? Int32Array.prototype        : undefined;
const Uint8Array_prototype        = typeof Uint8Array        !== 'undefined' ? Uint8Array.prototype        : undefined;
const Uint8ClampedArray_prototype = typeof Uint8ClampedArray !== 'undefined' ? Uint8ClampedArray.prototype : undefined;
const Uint16Array_prototype       = typeof Uint16Array       !== 'undefined' ? Uint16Array.prototype       : undefined;
const Uint32Array_prototype       = typeof Uint32Array       !== 'undefined' ? Uint32Array.prototype       : undefined;
