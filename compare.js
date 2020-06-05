
const { shared_tests } = require('./tests.js');

console.log('true-clone');
const { clone } = require('./clone.js');
shared_tests(clone);

