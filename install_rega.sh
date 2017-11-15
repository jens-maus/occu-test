#!/bin/bash

echo "current time/date: $(date)"

echo "creating directories"
mkdir -p /etc/config
mkdir -p /www/rega
mkdir -p /config

echo "creating hook scripts"
echo -e "#!/bin/bash\necho /bin/hm_startup executed" > /bin/hm_startup
echo -e "#!/bin/bash\necho /bin/hm_autoconf executed" > /bin/hm_autoconf
chmod a+x /bin/hm_startup /bin/hm_autoconf

echo "cloning/pulling occu"
DIR=$(pwd)
if cd /occu 2>/dev/null; then git pull; else git clone https://github.com/eq-3/occu /occu; fi
cd ${DIR}

echo "copying files"
cp -v /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/etc/rega.conf /etc/
cp -v /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/etc/config/InterfacesList.xml /etc/config/
cp -v /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/bin/* /bin/
ln -sf /bin/ReGaHss /bin/ReGaHss.legacy
cp -v homematic.regadom /etc/config/

echo "installing i386 libs"
apt-get update
apt-get install libc6:i386 libstdc++6:i386

echo "adding /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/lib/ to ldconfig"
echo "/occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/lib/" > /etc/ld.so.conf.d/hm.conf
ldconfig
