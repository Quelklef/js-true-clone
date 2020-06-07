#!/bin/sh
results="$(node tests.js)"
echo "$results"
failures="$(echo "$results" | grep --color=never '\[-]')"
if [ -n "$failures" ]; then
  echo
  echo "failures:"
  echo "$failures"
else
  echo "all tests passing!"
fi
