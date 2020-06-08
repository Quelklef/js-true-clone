#!/bin/bash
echo '' > comparison_results.txt
packages=("true-clone" "clone" "lodash.clonedeep")
for package in "${packages[@]}"; do
  echo "============ PACKAGE: $package ============" >> comparison_results.txt
  PACKAGE="$package" npx mocha tests.js >> comparison_results.txt
done
echo "see comparison_results.txt"
exit 0
