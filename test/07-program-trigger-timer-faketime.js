/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, max-nested-callbacks, prefer-arrow-callback, max-params, capitalized-comments, no-multi-spaces */

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
    function test(time, program, repetition = 1, waittime = 20000) {
        describe('Testing for ' + repetition + ' executions of \'' + program + '\' @ ' + time, function () {
            // initialize test environment
            initTest(flavor, false, time);

            // perform the timer test
            describe('runnig timer test...', function () {
                for (let i = 0; i < repetition; i++) {
                    it('[' + (i + 1) + '/' + repetition + '] should call program \'' + program + '\'', function (done) {
                        if (!procs.rega) {
                            return this.skip();
                        }
                        this.slow(waittime);
                        this.timeout(waittime);
                        subscribe('rega', new RegExp('execute Program ID = .*' + id), function (output) {
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
        test('2020-01-01 23:59:48 CET',  'Time0000');
        test('2020-01-01 00:29:48 CET',  'Time0030');
        test('2020-01-01 00:59:48 CET',  'Time0100');

        // Perform test of the short 10s timers
        test('2020-01-01 00:00:00 CET',  'TimeEvery10s', 3, 30000);
        test('2020-03-29 01:59:48 CET',  'TimeEvery10s', 6, 30000); // winter->summer
        test('2020-10-25 02:59:48 CEST', 'TimeEvery10s', 6, 30000); // summer->winter

        // Perform long running timer test for year switch
        test('2019-12-31 23:58:48 CET',  'TimeEveryMinute', 3, 65000);

        // Perform long running regular timer test at DST boundaries
        test('2020-03-29 01:58:40 CET',  'TimeEveryMinute', 5, 70000); // winter->summer
        test('2020-10-25 02:58:40 CEST', 'TimeEveryMinute', 5, 70000); // summer->winter

        // Leap/non-leap year tests (Feb, 29. 2020, Feb, 28. 2021)
        test('2020-02-29 01:59:48 CET',  'Time0200');
        test('2020-02-29 23:58:48 CET',  'TimeEveryMinute', 5, 70000);
        test('2021-02-28 23:58:48 CET',  'TimeEveryMinute', 5, 70000);

        // -> start of DST (winter->summer) in leap year
        test('2020-03-28 23:58:48 CET',  'TimeEveryMinute', 5, 70000); // day switch before DST switchdate
        test('2020-03-29 00:59:48 CET',  'Time0100');
        test('2020-03-29 01:29:48 CET',  'Time0130');
        test('2020-03-29 01:54:48 CET',  'Time0155');
        test('2020-03-29 01:59:48 CET',  'Time0200');
        // test('2020-03-29 02:04:48 CET', 'Time0205'); // not in DST
        // test('2020-03-29 02:29:48 CET', 'Time0230'); // not in DST
        // test('2020-03-29 02:54:48 CET', 'Time0255'); // not in DST
        // test('2020-03-29 02:59:48 CET', 'Time0300'); // not in DST
        test('2020-03-29 03:04:48 CEST', 'Time0305');
        test('2020-03-29 03:29:48 CEST', 'Time0330');
        test('2020-03-29 23:58:48 CEST', 'TimeEveryMinute', 5, 70000); // day switch after DST switchdate

        // -> end of DST (summer->winter) in leap year
        test('2020-10-24 23:58:48 CEST', 'TimeEveryMinute', 5, 70000); // day switch before DST switchdate
        test('2020-10-25 00:59:48 CEST', 'Time0100');
        test('2020-10-25 01:29:48 CEST', 'Time0130');
        test('2020-10-25 01:54:48 CEST', 'Time0155');
        test('2020-10-25 01:59:48 CEST', 'Time0200');
        test('2020-10-25 02:04:48 CEST', 'Time0205');
        test('2020-10-25 02:29:48 CEST', 'Time0230');
        test('2020-10-25 02:54:48 CEST', 'Time0255');
        test('2020-10-25 02:59:48 CEST', 'Time0200'); // @ 03:00 (CEST) time will be switch to 02:00 (CET), thus Time0200 should trigger
        test('2020-10-25 02:59:48 CET', 'Time0300');
        test('2020-10-25 03:04:48 CET', 'Time0305');
        test('2020-10-25 03:29:48 CET', 'Time0330');
        test('2020-10-25 23:58:48 CET', 'TimeEveryMinute', 5, 70000); // day switch after DST switchdate
    });
});
