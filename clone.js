
module.exports = { clone };

function clone(source) {

  if (typeof source !== 'object' || source === null) {
    return source;
  }

  if (source instanceof Array) {
    return source.map(x => clone(x));
  }

  const result = {};
  for (const key in source) {
    result[key] = clone(source[key]);
  }
  return result;

}

