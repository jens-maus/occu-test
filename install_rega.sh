#!/bin/bash

echo "creating directories"
sudo mkdir /etc/config
sudo mkdir -p /www/rega
sudo mkdir /config

echo "creating hook scripts"
sudo echo -e "#!/bin/bash\necho /bin/hm_startup executed" > /bin/hm_startup
sudo echo -e "#!/bin/bash\necho /bin/hm_autoconf executed" > /bin/hm_autoconf
sudo chmod a+x /bin/hm_startup /bin/hm_autoconf

echo "cloning repository"
sudo git clone https://github.com/eq-3/occu /occu

echo "copying files"
sudo cp -v /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/etc/rega.conf /etc/
sudo cp -v /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/etc/config/InterfacesList.xml /etc/config/
sudo cp -v /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/bin/* /bin/

echo "installing libs"
sudo apt-get install libc6:i386 libstdc++6:i386
echo "adding /occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/lib/ to ldconfig"
echo "/occu/X86_32_Debian_Wheezy/packages-eQ-3/WebUI/lib/" > /etc/ld.so.conf.d/hm.conf
sudo ldconfig
