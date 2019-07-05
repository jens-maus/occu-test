#!/bin/bash

FLAVOR=${FLAVOR:-beta}

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
export FLAVOR=${FLAVOR}
npm test ${1}
