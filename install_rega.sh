#!/bin/bash

echo "creating directories"
mkdir /etc/config
mkdir -p /www/rega
mkdir /config

echo "creating hook scripts"
echo -e "#!/bin/bash\necho /bin/hm_startup executed" > /bin/hm_startup
echo -e "#!/bin/bash\necho /bin/hm_autoconf executed" > /bin/hm_autoconf
chmod a+x /bin/hm_startup /bin/hm_autoconf

echo "cloning repository"
git clone https://github.com/eq-3/occu /occu

echo "copying files"
cp -v /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/etc/rega.conf /etc/
cp -v /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/etc/config/InterfacesList.xml /etc/config/
cp -v /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/bin/* /bin/

echo "installing libs"
apt-get install libc6:i386 libstdc++6:i386
echo "/occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/lib/" > /etc/ld.so.conf.d/hm.conf
ldconfig
