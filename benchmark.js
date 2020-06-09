
const Benchmark = require('benchmark');
const suite = new Benchmark.Suite();

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

const native_object_types = [
  [1, [2], [[3], 4]],
  new Map([['from', 'to'], ['src', () => 'dest']]),
  new Set([true, 'i', Symbol(), 'am', 16n, 'contained', undefined]),
  //new Number(3.14),  // package 'clone' fails
  //new String('string'),  // package 'clone' fails
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

function registerPackage(package_name, clone_func) {
  suite
    .add(`[${package_name}] primitives         `, () => primitives.forEach(clone_func))
    .add(`[${package_name}] native object types`, () => native_object_types.forEach(clone_func))
    .add(`[${package_name}] plain object       `, () => clone_func(plain_object))
    .add(`[${package_name}] rich object        `, () => clone_func(rich_object))
    ;
}

const _clone = require('clone');
registerPackage('true-clone', require('./clone.js').clone);
registerPackage('clone', value => _clone(value, true, undefined, undefined, true));
registerPackage('lodash.clonedeep', require('lodash.clonedeep'));
registerPackage('rfdc', require('rfdc')({ proto: false, circles: true }));

suite
  .on('cycle', event => {
    console.log('' + event.target);
  })
  .run()
  ;
