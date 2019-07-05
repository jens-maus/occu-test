#!/bin/bash

FLAVOR=${FLAVOR:-beta}

echo "STEP: running occu test..."
export FLAVOR=${FLAVOR}
npm test ${1}
