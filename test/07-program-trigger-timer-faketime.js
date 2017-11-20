/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, max-nested-callbacks */

const {
    cp,
    rega,
    subscribe,
    startRega,
    startSim,
    procs,
    simSubscriptions,
    simBuffer,
    regaSubscriptions,
    regaBuffer,
    flavors
} = require('../lib/helper.js');

require('should');

flavors.forEach(flavor => {
    function test(time, program, id) {
        describe('Timer test @ ' + time + '...', () => {
            describe('starting ReGaHss' + flavor, () => {
                it('should fake datetime', function (done) {
                    this.timeout(5 * 365 * 24 * 60 * 60 * 1000);
                    cp.exec('sudo /bin/date -s "' + time + '" +"%Y-%m-%d %H:%M:%S %z (%Z) : %s"', (e, stdout) => {
                        if (e) {
                            done(e);
                        } else if (!stdout || stdout.replace('\n', '').length === 0) {
                            done(new Error('invalid faketime: "' + time + '"'));
                        } else {
                            done();
                        }
                        console.log('          ' + stdout.replace('\n', ''));
                    });
                });
                it('should start', () => {
                    startRega(flavor);
                });
                it('wait for HTTP server to be ready', function (done) {
                    this.timeout(60000);
                    subscribe('rega', /HTTP server started successfully/, () => {
                        if (flavor === '.legacy') {
                            setTimeout(done, 10000);
                        } else {
                            done();
                        }
                    });
                });

                it('should output DST offset', function (done) {
                    this.timeout(30000);
                    subscribe('rega', /DST offset =/, output => {
                        done();
                        console.log('          ' + output);
                    });
                });

                it('should output reference time', function (done) {
                    this.timeout(30000);
                    subscribe('rega', /GetNextTimer called for reference time/, output => {
                        done();
                        console.log('          ' + output);
                    });
                });
            });

            describe('perform timer test', () => {
                it('should call Program ID = ' + id + ' (program ' + program + ')', function (done) {
                    this.timeout(20000);
                    subscribe('rega', new RegExp('execute Program ID = ' + id), output => {
                        // Console.log('        ' + output);
                        cp.exec('/bin/date', (e, stdout) => {
                            console.log('          ' + output);
                            done();
                        });
                    });
                });
            });

            describe('stopping ReGaHss' + flavor, () => {
                it('should stop', function (done) {
                    this.timeout(60000);
                    procs.rega.on('close', () => {
                        procs.rega = null;
                        done();
                    });
                    cp.spawnSync('killall', ['-9', 'ReGaHss' + flavor]);
                });
            });
        });
    }

    // Long Running test for EveryMinute Timer over DST change
    (function () {
        const ftime = '2020-10-25 02:58:40 CEST';
        describe('Timer test EveryMinute starting @ ' + ftime + '...', () => {
            describe('starting ReGaHss' + flavor, () => {
                it('should fake datetime', function (done) {
                    this.timeout(5 * 365 * 24 * 60 * 60 * 1000);
                    cp.exec('sudo /bin/date -s "' + ftime + '" +"%Y-%m-%d %H:%M:%S %z (%Z) : %s"', (e, stdout, stderr) => {
                        if (e) {
                            done(e);
                        } else if (!stdout || stdout.replace('\n', '').length === 0) {
                            console.error(stderr);
                            done(new Error('invalid faketime: "' + ftime + '"'));
                        } else {
                            done();
                        }
                        console.log('          ' + stdout.replace('\n', ''));
                    });
                });
                it('should start', () => {
                    startRega(flavor);
                });
                it('wait for HTTP server to be ready', function (done) {
                    this.timeout(60000);
                    subscribe('rega', /HTTP server started successfully/, () => {
                        if (flavor === '.legacy') {
                            setTimeout(done, 10000);
                        } else {
                            done();
                        }
                    });
                });

                it('should output DST offset', function (done) {
                    this.timeout(30000);
                    subscribe('rega', /DST offset =/, output => {
                        done();
                        console.log('          ' + output);
                    });
                });

                it('should output reference time', function (done) {
                    this.timeout(30000);
                    subscribe('rega', /GetNextTimer called for reference time/, output => {
                        done();
                        console.log('          ' + output);
                    });
                });
            });

            describe('perform timer test', () => {
                it('should call Program ID = 1302 (program TimeEveryMinute) @ Rega Start', function (done) {
                    this.timeout(25000);
                    subscribe('rega', /execute Program ID = 1302/, output => {
                        cp.exec('/bin/date', (e, stdout) => {
                            console.log('          ' + stdout);
                            console.log('          ' + output);
                            done();
                        });
                    });
                });
                it('should call Program ID = 1302 (program TimeEveryMinute) @ 02:59:00 CEST', function (done) {
                    this.timeout(65000);
                    subscribe('rega', /execute Program ID = 1302/, output => {
                        cp.exec('/bin/date', (e, stdout) => {
                            console.log('          ' + stdout);
                            console.log('          ' + output);
                            done();
                        });
                    });
                });
                it('should call Program ID = 1302 (program TimeEveryMinute) @ 02:00:00 CET', function (done) {
                    this.timeout(65000);
                    subscribe('rega', /execute Program ID = 1302/, output => {
                        cp.exec('/bin/date', (e, stdout) => {
                            console.log('          ' + stdout);
                            console.log('          ' + output);
                            done();
                        });
                    });
                });
                it('should call Program ID = 1302 (program TimeEveryMinute) @ 02:01:00 CET', function (done) {
                    this.timeout(65000);
                    subscribe('rega', /execute Program ID = 1302/, output => {
                        cp.exec('/bin/date', (e, stdout) => {
                            console.log('          ' + stdout);
                            console.log('          ' + output);
                            done();
                        });
                    });
                });
            });

            describe('stopping ReGaHss' + flavor, () => {
                it('should stop', function (done) {
                    this.timeout(60000);
                    procs.rega.on('close', () => {
                        procs.rega = null;
                        done();
                    });
                    cp.spawnSync('killall', ['-9', 'ReGaHss' + flavor]);
                });
            });
        });
    })();

    (function () {
        const ftime = '2020-03-29 01:58:40 CET';
        describe('Timer test EveryMinute starting @ ' + ftime + '...', () => {
            describe('starting ReGaHss' + flavor, () => {
                it('should fake datetime', function (done) {
                    this.timeout(5 * 365 * 24 * 60 * 60 * 1000);
                    cp.exec('sudo /bin/date -s "' + ftime + '" +"%Y-%m-%d %H:%M:%S %z (%Z) : %s"', (e, stdout, stderr) => {
                        if (e) {
                            done(e);
                        } else if (!stdout || stdout.replace('\n', '').length === 0) {
                            console.error(stderr);
                            done(new Error('invalid faketime: "' + ftime + '"'));
                        } else {
                            done();
                        }
                        console.log('          ' + stdout.replace('\n', ''));
                    });
                });
                it('should start', () => {
                    startRega(flavor);
                });
                it('wait for HTTP server to be ready', function (done) {
                    this.timeout(60000);
                    subscribe('rega', /HTTP server started successfully/, () => {
                        if (flavor === '.legacy') {
                            setTimeout(done, 10000);
                        } else {
                            done();
                        }
                    });
                });

                it('should output DST offset', function (done) {
                    this.timeout(30000);
                    subscribe('rega', /DST offset =/, output => {
                        done();
                        console.log('          ' + output);
                    });
                });

                it('should output reference time', function (done) {
                    this.timeout(30000);
                    subscribe('rega', /GetNextTimer called for reference time/, output => {
                        done();
                        console.log('          ' + output);
                    });
                });
            });

            describe('perform timer test', () => {
                it('should call Program ID = 1302 (program TimeEveryMinute) @ Rega Start', function (done) {
                    this.timeout(25000);
                    subscribe('rega', /execute Program ID = 1302/, output => {
                        cp.exec('/bin/date', (e, stdout) => {
                            console.log('          ' + stdout);
                            console.log('          ' + output);
                            done();
                        });
                    });
                });
                it('should call Program ID = 1302 (program TimeEveryMinute) @ 01:59:00 CET', function (done) {
                    this.timeout(65000);
                    subscribe('rega', /execute Program ID = 1302/, output => {
                        cp.exec('/bin/date', (e, stdout) => {
                            console.log('          ' + stdout);
                            console.log('          ' + output);
                            done();
                        });
                    });
                });
                it('should call Program ID = 1302 (program TimeEveryMinute) @ 03:00:00 CEST', function (done) {
                    this.timeout(65000);
                    subscribe('rega', /execute Program ID = 1302/, output => {
                        cp.exec('/bin/date', (e, stdout) => {
                            console.log('          ' + stdout);
                            console.log('          ' + output);
                            done();
                        });
                    });
                });
                it('should call Program ID = 1302 (program TimeEveryMinute) @ 03:01:00 CEST', function (done) {
                    this.timeout(65000);
                    subscribe('rega', /execute Program ID = 1302/, output => {
                        cp.exec('/bin/date', (e, stdout) => {
                            console.log('          ' + stdout);
                            console.log('          ' + output);
                            done();
                        });
                    });
                });
            });

            describe('stopping ReGaHss' + flavor, () => {
                it('should stop', function (done) {
                    this.timeout(60000);
                    procs.rega.on('close', () => {
                        procs.rega = null;
                        done();
                    });
                    cp.spawnSync('killall', ['-9', 'ReGaHss' + flavor]);
                });
            });
        });
    })();

    describe('Running ' + __filename.split('/').reverse()[0] + ' test...', () => {
        test('2020-01-01 00:59:48 CET', 'Time0100', '1314');

        // Leap year, Feb, 29. 2020
        test('2020-02-29 01:59:48 CET', 'Time0200', '1470');

        // -> start of DST (winter->summer) in leap year
        test('2020-03-29 00:59:48 CET', 'Time0100', '1314');
        test('2020-03-29 01:29:48 CET', 'Time0130', '1430');
        test('2020-03-29 01:54:48 CET', 'Time0155', '1458');
        test('2020-03-29 01:59:48 CET', 'Time0200', '1470');
        // Test('2020-03-29 02:04:48 CET', 'Time0205', '1498'); // not in DST
        // test('2020-03-29 02:29:48 CET', 'Time0230', '1510'); // not in DST
        // test('2020-03-29 02:54:48 CET', 'Time0255', '1522'); // not in DST
        // test('2020-03-29 02:59:48 CET', 'Time0300', '1534'); // not in DST
        test('2020-03-29 03:04:48 CEST', 'Time0305', '1546');
        test('2020-03-29 03:29:48 CEST', 'Time0330', '1558');

        // -> end of DST (summer->winter) in leap year
        test('2020-10-25 00:59:48 CEST', 'Time0100', '1314');
        test('2020-10-25 01:29:48 CEST', 'Time0130', '1430');
        test('2020-10-25 01:54:48 CEST', 'Time0155', '1458');
        test('2020-10-25 01:59:48 CEST', 'Time0200', '1470');
        test('2020-10-25 02:04:48 CEST', 'Time0205', '1498');
        test('2020-10-25 02:29:48 CEST', 'Time0230', '1510');
        test('2020-10-25 02:54:48 CEST', 'Time0255', '1522');
        // Test('2020-10-25 02:59:48 CEST', 'Time0300', '1534'); // @ 03:00 (CEST) time will be switch to 02:00 (CET) again, thus no Time0300 trigger (which is fine)
        test('2020-10-25 02:59:48 CET', 'Time0300', '1534');
        test('2020-10-25 03:04:48 CET', 'Time0305', '1546');
        test('2020-10-25 03:29:48 CET', 'Time0330', '1558');
    });
});
