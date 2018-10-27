/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, max-nested-callbacks, prefer-arrow-callback, max-params, capitalized-comments */

const {
    cp,
    rega,
    subscribe,
    procs,
    simSubscriptions,
    simBuffer,
    regaSubscriptions,
    regaBuffer,
    flavors,
    indent,
    initTest,
    cleanupTest
} = require('../lib/helper.js');

require('should');

flavors.forEach(function (flavor) {
    function test(time, program, id, repetition = 1, waittime = 20000) {
        describe('Testing for ' + repetition + ' executions of ' + program + ' (' + id + ') @ ' + time, function () {
            // initialize test environment
            initTest(flavor, false, time);

            // perform the timer test
            describe('runnig timer test...', function () {
                for (let i = 0; i < repetition; i++) {
                    it('[' + (i + 1) + '/' + repetition + '] should call Program ID = ' + id + ' (program ' + program + ')', function (done) {
                        if (!procs.rega) {
                            return this.skip();
                        }
                        this.slow(waittime);
                        this.timeout(waittime);
                        subscribe('rega', new RegExp('execute Program ID = ' + id), function (output) {
                            cp.exec('/bin/date', function (e, stdout) {
                                done();
                                console.log(indent(stdout.replace('\n', ''), 8), output);
                            });
                        });
                    });
                }
            });

            // cleanup test environment
            cleanupTest(flavor);
        });
    }

    describe('Running ' + __filename.split('/').reverse()[0] + ' [' + flavor + ']', function () {
        // Perform normal timer test for single execution
        test('2020-01-01 00:59:48 CET', 'Time0100', '1314');

        // Perform long running timer test for normal datetime
        test('2019-12-31 23:58:48 CET', 'TimeEveryMinute', '1302', 3, 65000);

        // Perform long running regular timer test at DST boundaries
        test('2020-10-25 02:58:40 CEST', 'TimeEveryMinute', '1302', 5, 70000);
        test('2020-03-29 01:58:40 CET', 'TimeEveryMinute', '1302', 5, 70000);

        // Leap year, Feb, 29. 2020
        test('2020-02-29 01:59:48 CET', 'Time0200', '1470');

        // -> start of DST (winter->summer) in leap year
        test('2020-03-29 00:59:48 CET', 'Time0100', '1314');
        test('2020-03-29 01:29:48 CET', 'Time0130', '1430');
        test('2020-03-29 01:54:48 CET', 'Time0155', '1458');
        test('2020-03-29 01:59:48 CET', 'Time0200', '1470');
        // test('2020-03-29 02:04:48 CET', 'Time0205', '1498'); // not in DST
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
        // test('2020-10-25 02:59:48 CEST', 'Time0300', '1534'); // @ 03:00 (CEST) time will be switch to 02:00 (CET) again, thus no Time0300 trigger (which is fine)
        test('2020-10-25 02:59:48 CET', 'Time0300', '1534');
        test('2020-10-25 03:04:48 CET', 'Time0305', '1546');
        test('2020-10-25 03:29:48 CET', 'Time0330', '1558');
    });
});
