
const { shared_tests, within } = require('./tests.js');

within('true-clone', () => {
  const { clone } = require('./clone.js');
  shared_tests(clone);
});

within('clone', () => {
  const clone = require('clone');
  shared_tests(value => clone(value, true, undefined, undefined, true));
});

within('lodash.clonedeep', () => {
  const clone = require('lodash.clonedeep');
  shared_tests(clone);
});
