# OCCU Test

[![Build Status](https://travis-ci.org/hobbyquaker/occu-test.svg?branch=master)](https://travis-ci.org/hobbyquaker/occu-test)

> Automated System Tests of ReGaHss - the HomeMatic (O)CCU "Logic Layer"

**... work in progress**


## homematic.regadom

The Rega is started with a prebuilt homematic.regadom:

#### Variables

* VarBool1
* VarEnum1
* VarNum1
* VarString1

#### Programs

* Bool1OnFalse - BidCoS-RF:13 PRESS_LONG
* Bool1OnTrue - BidCoS-RF:12 PRESS_LONG
* Bool1OnFalseUpdate - BidCoS-RF:14 PRESS_LONG
* Bool1OnTrueUpdate - BidCoS-RF:15 PRESS_LONG
* TimeEveryMinute - BidCoS-RF:50 PRESS_LONG
* Time0100 - BidCoS-RF:11 PRESS_LONG
* Time0130 - BidCoS-RF:20 PRESS_LONG
* Time0155 - BidCoS-RF:21 PRESS_LONG
* Time0200 - BidCoS-RF:22 PRESS_LONG
* Time0205 - BidCoS-RF:23 PRESS_LONG
* Time0230 - BidCoS-RF:24 PRESS_LONG
* Time0255 - BidCoS-RF:25 PRESS_LONG
* Time0300 - BidCoS-RF:26 PRESS_LONG
* Time0305 - BidCoS-RF:27 PRESS_LONG
* Time0330 - BidCoS-RF:28 PRESS_LONG
* Key16Key17 - on BidCoS-RF:16 PRESS_LONG => BidCoS-RF:17 PRESS_LONG
* Key1 - on BidCos-RF:1 PRESS_SHORT => BidCoS-RF:2 PRESS_LONG


## Todo

* ~~run tests on all 3 flavors of ReGaHss (legacy, standard, community)~~
* **documentation on how to run the tests in a local docker container**
* tests, tests, tests
* test all examples of the official homematic script documentation
* test time based triggers (edge cases: DST, leap year) **wip**
* test popular scripts published on homematic-forum.de
* ~~create a regadom with several test variables and programs~~ extend regadom with more testvars/programs/devices
* ~~integrate simulated rfd/hmipserver~~
* test device interactions (add/delete/readyconfig, test programs, ...)
* trigger travis builds on commits in occu repository
* WebUI tests?
* ...


## Links

* [occu](https://github.com/eq-3/occu)
* [hm-simulator](https://github.com/hobbyquaker/hm-simulator)
* [ccu x86 docker image](https://hub.docker.com/r/litti/ccu2/)


## Contributing

Help and Feedback highly appreciated, Pull Requests Welcome! :-)


## License

MIT (c) 2017 [Sebastian Raff](https://github.com/hobbyquaker)
