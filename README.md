# OCCU Test

[![Build Status](https://travis-ci.org/hobbyquaker/occu-test.svg?branch=master)](https://travis-ci.org/hobbyquaker/occu-test)

> Automated System Tests of ReGaHss - the HomeMatic (O)CCU "Logic Layer"

... work in progress, only a simple PoC until now.


## homematic.regadom

The Rega is started with a prebuilt homematic.regadom:

#### Variables

* VarBool1
* VarEnum1
* VarNum1
* VarString1

#### Programs

* Bool1OnFalse
* Bool1OnTrue
* Bool1OnFalseUpdate
* Bool1OnTrueUpdate
* TimeEveryMinute
* Time0100


## Todo

* ~~run tests on all 3 flavors of ReGaHss (legacy, standard, community)~~
* documentation on how to run the tests in a local docker container
* tests, tests, tests
* test all examples of the official homematic script documentation
* test time based triggers (edge cases: DST, leap year)
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
