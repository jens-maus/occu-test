# OCCU Test

[![Build Status](https://travis-ci.org/hobbyquaker/occu-test.svg?branch=master)](https://travis-ci.org/hobbyquaker/occu-test)

> Automated System Tests of ReGaHss - the HomeMatic (O)CCU "Logic Layer"

**... work in progress**


## homematic.regadom

The Rega is started with a prebuilt homematic.regadom:

#### Variables

* VarBool1 - id: 1237
* VarEnum1
* VarNum1
* VarString1

#### Programs

* Bool1OnFalse - BidCoS-RF:13 PRESS_LONG
* Bool1OnTrue - BidCoS-RF:12 PRESS_LONG
* Bool1OnFalseUpdate - BidCoS-RF:14 PRESS_LONG
* Bool1OnTrueUpdate - BidCoS-RF:15 PRESS_LONG
* TimeEveryMinute - id: 1302 - BidCoS-RF:50 PRESS_LONG
* Time0100 - id: 1314 - BidCoS-RF:11 PRESS_LONG
* Time0130 - id: 1430 - BidCoS-RF:20 PRESS_LONG
* Time0155 - id: 1458 - BidCoS-RF:21 PRESS_LONG
* Time0200 - id: 1470 - BidCoS-RF:22 PRESS_LONG
* Time0205 - id: 1498 - BidCoS-RF:23 PRESS_LONG
* Time0230 - id: 1510 - BidCoS-RF:24 PRESS_LONG
* Time0255 - id: 1522 - BidCoS-RF:25 PRESS_LONG
* Time0300 - id: 1534 - BidCoS-RF:26 PRESS_LONG
* Time0305 - id: 1546 - BidCoS-RF:27 PRESS_LONG
* Time0330 - id: 1558 - BidCoS-RF:28 PRESS_LONG
* Key16Key17 - on BidCoS-RF:16 PRESS_LONG => BidCoS-RF:17 PRESS_LONG
* Key1 - on BidCos-RF:1 PRESS_SHORT => BidCoS-RF:2 PRESS_LONG


## Todo

* test all examples of the official homematic script documentation **wip**
* test script error handling **wip**
* test popular scripts published on homematic-inside.de and homematic-forum.de **wip**
* extend regadom with more testvars/programs/devices
* add more devices to rfd and hmipserver simulator and add them to regadom
* test device interactions (add/delete/readyconfig, test programs, ...) **wip**
* trigger travis builds on commits in occu repository
* WebUI tests?
* ...

#### done. :-)

* ~~run tests on all 3 flavors of ReGaHss (legacy, standard, community)~~
* ~~documentation on how to run the tests in a local docker container~~
* ~~test time based triggers (edge cases: DST, leap year)~~
* ~~create a regadom with several test variables and programs~~ 
* ~~integrate simulated rfd/hmipserver~~


## Links

* [occu](https://github.com/eq-3/occu)
* [hm-simulator](https://github.com/hobbyquaker/hm-simulator) (simulates rfd/hmipserver)
* [ccu x86 docker image](https://hub.docker.com/r/litti/ccu2/) (used for creation of the prebuilt homematic.regadom)
* [homematic-rega](https://github.com/hobbyquaker/homematic-rega) (Node.js Homematic CCU ReGaHSS Remote Script Interface)


## Contributing

Help and Feedback highly appreciated, Pull Requests Welcome! :-)


## License

MIT (c) 2017 [Sebastian Raff](https://github.com/hobbyquaker)
