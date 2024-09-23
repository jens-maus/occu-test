#!/bin/bash

FLAVOR=${FLAVOR:-beta}

if [[ ! -f /bin/ReGaHss.${FLAVOR} ]]; then
  echo "::warning /bin/ReGaHss.${FLAVOR} missing"
  exit 0
fi

source ~/.bashrc
source ~/.profile
if [ ! -d ${NVM_DIR} ]; then
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
  source ~/.bashrc
  source ~/.profile
fi
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

echo "STEP: running occu test..."
export TZ=Europe/Berlin
export FLAVOR=${FLAVOR}
npm test ${1}
