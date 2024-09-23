#!/bin/bash

FLAVOR=${FLAVOR:-beta}
ARCH=${ARCH:-X86_32_GCC8}

umask 022

echo "STEP: creating directories"
[[ ! -d /etc/config ]] && mkdir -p /etc/config
[[ ! -d /www/rega ]] && mkdir -p /www/rega
[[ ! -d /config ]] && mkdir -p /config

echo "STEP: creating hook scripts"
echo -e "#!/bin/bash\necho /bin/hm_startup executed" > /bin/hm_startup
echo -e "#!/bin/bash\necho /bin/hm_autoconf executed" > /bin/hm_autoconf
chmod a+x /bin/hm_startup /bin/hm_autoconf

echo "STEP: installing required packages"
if [[ ! "${ARCH}" =~ "64" ]]; then
  #dpkg --add-architecture i386
  #apt-get -qq update || true
  if [ $(dpkg-query -W -f='${Status}' libc6:i386 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
    apt-get -qq install libc6:i386
  fi
  if [ $(dpkg-query -W -f='${Status}' libstdc++6:i386 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
    apt-get -qq install libstdc++6:i386
  fi
fi
if [ $(dpkg-query -W -f='${Status}' expect-dev 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
  apt-get -qq install expect-dev
fi

echo "STEP: check for libfaketime"
if [[ ! -x /bin/faketime ]]; then
  # checkout and compile
  git clone --depth 1 --branch=master https://github.com/wolfcw/libfaketime.git /faketime
  if [[ ! "${ARCH}" =~ "64" ]]; then
    # get everyting setup for a 32bit compile
    apt-get -qq install gcc-multilib
    #(cd /faketime; git checkout 112809f986548903f8ff0923c6bfb715f29a2acd; CC=gcc CFLAGS="-m32 -DFORCE_MONOTONIC_FIX" LDFLAGS="-m32 -L/usr/lib32" make PREFIX= install)
    #(cd /faketime; git checkout 112809f986548903f8ff0923c6bfb715f29a2acd; CC=gcc CFLAGS="-m32" LDFLAGS="-m32 -L/usr/lib32" make PREFIX= install)
    (cd /faketime; git checkout v0.9.10; CC=gcc CFLAGS="-m32" LDFLAGS="-m32 -L/usr/lib32" make PREFIX= install)
  else
    (cd /faketime; git checkout v0.9.10; CC=gcc CFLAGS="" LDFLAGS="-L/usr/lib" make PREFIX= install)
  fi
fi

echo "STEP: cloning occu"
if [[ -d /occu ]]; then
  (cd /occu; git pull)
else
  git clone --depth=1 --branch=master https://github.com/jens-maus/occu /occu
fi
(cd /occu; git rev-parse HEAD)

echo "STEP: copying OCCU files"
cp -v rega.conf /etc/
echo -e "XmlRpcServerPort=31999" >>/etc/rega.conf
echo -e "SessionMaxCount=300" >>/etc/rega.conf
cp -v InterfacesList.xml /etc/config/

cp -v /occu/${ARCH}/packages-eQ-3/WebUI/bin/ReGaHss.* /bin/
cp -v /occu/${ARCH}/packages-eQ-3/WebUI-Beta/bin/ReGaHss /bin/ReGaHss.beta
rm -rf /www
mkdir -p /www
cp -a /occu/WebUI/www/* /www/
cp -v homematic.regadom /etc/config/
cp -v /occu/${ARCH}/packages-eQ-3/WebUI/bin/tclsh /bin/tclsh8.2
cp -av /occu/${ARCH}/packages-eQ-3/WebUI/lib/tcl8.2 /lib/
rm -f /bin/tclsh
ln -s /bin/tclsh8.2 /bin/tclsh
chmod -R a+rw /etc/config
[[ ${FLAVOR} =~ beta ]] && echo "/occu/${ARCH}/packages-eQ-3/WebUI-Beta/lib/" >/etc/ld.so.conf.d/hm.conf
echo "/occu/${ARCH}/packages-eQ-3/WebUI/lib/" >>/etc/ld.so.conf.d/hm.conf
/sbin/ldconfig

# test to start and show link dependencies of ReGaHss
if [[ -f /bin/ReGaHss.${FLAVOR} ]]; then
  chmod a+rx /bin/ReGaHss.${FLAVOR}
  ldd /bin/ReGaHss.${FLAVOR}
  /bin/ReGaHss.${FLAVOR} -h
else
  echo "::warning /bin/ReGaHss.${FLAVOR} missing"
  exit 0
fi

echo "STEP: installing nvm/nodejs dependencies"
source ~/.bashrc
source ~/.profile
if [ ! -d ${NVM_DIR} ]; then
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
  source ~/.bashrc
  source ~/.profile
fi
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
[ -x /usr/bin/nvm ] && nvm install 12
npm install
