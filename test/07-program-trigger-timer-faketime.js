/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, max-nested-callbacks, prefer-arrow-callback, max-params */

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
    flavors,
    indent
} = require('../lib/helper.js');

require('should');

flavors.forEach(function (flavor) {
    function test(time, program, id, repetition = 1, waittime = 20000) {
        describe('Testing for ' + repetition + ' executions of ' + program + ' (' + id + ') @ ' + time, function () {
            describe('starting ReGaHss' + flavor, function () {
                it('should fake datetime', function (done) {
                    this.slow(5 * 365 * 24 * 60 * 60 * 1000);
                    this.timeout(5 * 365 * 24 * 60 * 60 * 1000);
                    cp.exec('sudo /bin/date -s "' + time + '" +"%Y-%m-%d %H:%M:%S %z (%Z) : %s"', function (e, stdout) {
                        if (e) {
                            done(e);
                        } else {
                            if (!stdout || stdout.replace('\n', '').length === 0) {
                                done(new Error('invalid faketime: "' + time + '"'));
                            } else {
                                done();
                            }
                            console.log(indent(stdout.replace('\n', ''), 10));
                        }
                    });
                });

                it('should start', function () {
                    startRega(flavor);
                });

                it('wait for HTTP server to be ready', function (done) {
                    this.slow(10000);
                    this.timeout(60000);
                    subscribe('rega', /HTTP server started successfully/, function () {
                        if (flavor === '.legacy') {
                            setTimeout(done, 10000);
                        } else {
                            done();
                        }
                    });
                });

                it('should output DST offset', function (done) {
                    this.slow(10000);
                    this.timeout(30000);
                    subscribe('rega', /DST offset =/, function (output) {
                        done();
                        console.log(indent(output, 10));
                    });
                });

                it('should output reference time', function (done) {
                    this.slow(10000);
                    this.timeout(30000);
                    subscribe('rega', /GetNextTimer called for reference time/, function (output) {
                        done();
                        console.log(indent(output, 10));
                    });
                });
            });

            describe('perform timer test', function () {
                for (let i = 0; i < repetition; i++) {
                    it('[' + (i + 1) + '/' + repetition + '] should call Program ID = ' + id + ' (program ' + program + ')', function (done) {
                        this.slow(waittime);
                        this.timeout(waittime);
                        subscribe('rega', new RegExp('execute Program ID = ' + id), function (output) {
                            cp.exec('/bin/date', function (e, stdout) {
                                done();
                                console.log(indent(stdout.replace('\n', ''), 10), output);
                            });
                        });
                    });
                }
            });

            describe('stopping ReGaHss' + flavor, function () {
                it('should stop', function (done) {
                    this.timeout(60000);
                    procs.rega.on('close', function () {
                        procs.rega = null;
                        done();
                    });
                    cp.spawnSync('killall', ['-9', 'ReGaHss' + flavor]);
                });
            });
        });
    }

    describe('Running ' + __filename.split('/').reverse()[0] + ' test...', function () {
        // Perform normal timer test for single execution
        test('2020-01-01 00:59:48 CET', 'Time0100', '1314');

        // Perform long running timer test for normal datetime
        test('2019-12-31 23:58:48 CET', 'TimeEveryMinute', '1302', 3, 65000);

        // Perform long running timer test at DST boundaries
        test('2020-10-25 02:58:40 CEST', 'TimeEveryMinute', '1302', 3, 65000);
        test('2020-03-29 01:58:40 CET', 'TimeEveryMinute', '1302', 3, 65000);

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
