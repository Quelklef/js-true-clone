
const Benchmark = require('benchmark');

const suite = new Benchmark.Suite();

// Benchmark.options.maxTime = 0.1;

const _clone = require('clone');
const algorithms = {
  true_clone: require('./clone.js').clone,
  clone: value => _clone(value, true, undefined, undefined, true),
  ['lodash.clonedeep']: require('lodash.clonedeep'),
  rfdc: require('rfdc')({ proto: false, circles: true }),
}

function format(package_name, title, info) {
  return `${package_name.padStart(20)} / ${title.padEnd(10)} :: ${(info + ' ').padEnd(30, '.')}`;
}

const cases = [

  // == PRIMITIVES == //
  
  (package_name, clone_func) => {
    const primitives = [null, undefined, true, false, 0, 1, -1, 12n, 3.14, Number.NaN, 'string', Symbol()];
    const label = format(package_name, 'primitive', 'X')
    suite.add(label, () => primitives.forEach(clone_func));
  },

  // == ARRAY == //

  // pure/mnky -- monkeypatched or not
  // hom/het -- homogenous or heterogeneous
  // dense/sparse -- dense or sparse
  // small/large -- small or large
  
  (package_name, clone_func) => {
    const array = new Array(10).fill(null).map((_, i) => i);
    suite.add(format(package_name, 'Array', 'pure hom dense_ small'), () => clone_func(array))
  },

  (package_name, clone_func) => {
    const array = [1, null, ,,, undefined, Symbol() ,, 'string', 12n];  // length 10
    array.custom_prop = 'val';
    suite.add(format(package_name, 'Array', 'mnky het sparse small'), () => clone_func(array));
  },

  (package_name, clone_func) => {
    const array = new Array(1e5).fill(null).map((_, i) => i);
    suite.add(format(package_name, 'Array', 'pure hom dense_ large'), () => clone_func(array));
  },

  // == OBJECT == //

  (package_name, clone_func) => {
    const object = { i_am: 'plain', child: { array: [14, 15, 16] } };
    suite.add(format(package_name, 'Object', 'plain small'), () => clone_func(object));
  },

  (package_name, clone_func) => {
    const object = Object.create({ delimiter: ' & ' });
    object.items = [1, 2, 3, 4];
    Object.defineProperty(object, 'toString', { get() { return this.items.join(this.delimiter) } });
    suite.add(format(package_name, 'Object', 'rich_ small'), () => clone_func(object));
  },

  // == OTHER == //
  
  (package_name, clone_func) => {
    const objects = [
      [1, [2], [[3], 4]],
      new Map([['from', 'to'], ['src', () => 'dest']]),
      new Set([true, 'i', Symbol(), 'am', 16n, 'contained', undefined]),
      new Boolean(true),
    ];
    suite.add(format(package_name, 'obj types', 'X'), () => objects.forEach(clone_func));
  },
  
];

if (process.argv.length === 2) {

  for (const package_name in algorithms) {
    for (const test_case of cases) {
      test_case(package_name, algorithms[package_name]);
    }
  }
  
} else if (process.argv[2] === '--transpose') {

  for (const test_case of cases) {
    for (const package_name in algorithms) {
      test_case(package_name, algorithms[package_name]);
    }
  }
  
} else {

  console.log('bad arguments; call with none or with --transpose');
  process.exit(1);

}

// ripped from benchmark source
function formatNumber(number) {
  number = String(number).split('.');
  return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') +
    (number[1] ? '.' + number[1] : '');
}
    
suite
  .on('cycle', event => {
    const results = event.target;
    console.log(results.name + (' ' + formatNumber(results.hz.toFixed(0))).padStart(12, '.') + ' ops/s +/- ' + results.stats.rme.toFixed(2) + '%');
  })
  .run()
  ;
