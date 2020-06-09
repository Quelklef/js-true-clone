

const _clone = require('clone');

const algos = {
  true_clone: require('./clone.js').clone,
  clone: value => _clone(value, true, undefined, undefined, true),
  lodash_clonedeep: require('lodash.clonedeep'),
  rfdc: require('rfdc')({ proto: false, circles: true }),
};

const Benchmark = require('benchmark');
const suite = new Benchmark.Suite();

// --

const primitives = [
  null,
  undefined,
  true,
  false,
  0,
  1,
  -1,
  12n,
  3.14,
  Number.NaN,
  'string',
  Symbol(),
];

const boxed_primitives = [
  new Number(3.14),
  new String('string'),
  new Boolean(true),
];

const plain_object = {
  i_am: 'plain',
  nested: true,
  child: {
    array: [14, 15, 16],
    map: new Map(),
  },
};

class FancyList {
  constructor(items, delimiter) {
    this.items = items;
    this.delimiter = delimiter;
  }

  add(item) {
    this.items.push(item);
  }

  get string() {
    return '[' + this.items.join(this.delimiter) + ']';
  }
}

const rich_object = new FancyList([1, 2, 3, 4], ' & ');

suite
  .add('[true-clone] primitives', () => primitives.forEach(algos.true_clone))
  .add('[true-clone] boxed primitives', () => boxed_primitives.forEach(algos.true_clone))
  .add('[true-clone] plain object', () => algos.true_clone(plain_object))
  .add('[true-clone] rich object', () => algos.true_clone(rich_object))

  .add('[clone] primitives', () => primitives.forEach(algos.clone))
  .add('[clone] boxed primitives', () => boxed_primitives.forEach(algos.clone))
  .add('[clone] plain object', () => algos.clone(plain_object))
  .add('[clone] rich object', () => algos.clone(rich_object))

  .add('[lodash.clonedeep] primitives', () => primitives.forEach(algos.lodash_clonedeep))
  .add('[lodash.clonedeep] boxed primitives', () => boxed_primitives.forEach(algos.lodash_clonedeep))
  .add('[lodash.clonedeep] plain object', () => algos.lodash_clonedeep(plain_object))
  .add('[lodash.clonedeep] rich object', () => algos.lodash_clonedeep(rich_object))

  .add('[rfdc] primitives', () => primitives.forEach(algos.rfdc))
  .add('[rfdc] boxed primitives', () => boxed_primitives.forEach(algos.rfdc))
  .add('[rfdc] plain object', () => algos.rfdc(plain_object))
  .add('[rfdc] rich object', () => algos.rfdc(rich_object))

  .on('cycle', event => {
    console.log('' + event.target);
  })
  .run()
  ;
