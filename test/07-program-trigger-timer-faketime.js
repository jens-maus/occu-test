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
    function test(time, program, desc = '', targetTime= '', repetition = 1, waittime = 20000) {
        describe('Testing ' + repetition + ' executions of \'' + program + '\' @ ' + time + ' \'' + desc + '\'', function () {
            // initialize test environment
            initTest(flavor, false, time);

            // perform the timer test
            describe('runnig timer test...', function () {
                for (let i = 0; i < repetition; i++) {
                    it('[' + (i + 1) + '/' + repetition + '] should call program \'' + program + '\' @ ' + targetTime, function (done) {
                        if (!procs.rega) {
                            return this.skip();
                        }
                        this.slow(waittime);
                        this.timeout(waittime);
                        subscribe('rega', new RegExp('execute Program ID = .*' + program), function (output) {
                            cp.exec('/bin/date +"%Y-%m-%d %H:%M:%S %Z"', function (e, stdout) {
                                if(targetTime === '' || stdout.includes(targetTime)) {
                                  done();
                                }
                                console.log(indent('@', 8), stdout.replace('\n', ''), ':', output);
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
        test('2020-01-01 23:59:48 CET',  'Time0000', 'TimerFixed @ 00:00', '2020-01-01 00:00:00 CET');
        test('2020-01-01 00:29:48 CET',  'Time0030', 'TimerFixed @ 00:30', '00:30:00 CET');
        test('2020-01-01 00:59:48 CET',  'Time0100', 'TimerFixed @ 01:00', '01:00:00 CET');

        // Perform test of the short 10s timers
        test('2020-01-01 00:00:00 CET',  'TimeEvery10s', 'TimerPeriodic (10s) on new year', '', 2, 30000);
        test('2020-03-29 01:59:48 CET',  'TimeEvery10s', 'TimerPeriodic (10s) during Winter->Summer DST change', '', 4, 30000);
        test('2020-10-25 02:59:48 CEST', 'TimeEvery10s', 'TimerPeriodic (10s) during Summer->Winter DST change', '', 4, 30000);

        // Perform test of day/night astro switches (Europe/Berlin) in DST and
        // and non-DST times
        test('2017-12-01 07:55:48 CET',  'TimeSpanDay',   'TimeSpanDay switch @ 07:56 (CET)');
        test('2017-12-01 15:55:48 CET',  'TimeSpanNight', 'TimeSpanNight switch @ 15:56 (CET)');
        test('2019-03-31 06:41:48 CEST', 'TimeSpanDay',   'TimeSpanDay switch @ 06:42 on DST day');
        test('2019-03-31 19:35:48 CEST', 'TimeSpanNight', 'TimeSpanNight switch @ 19:36 on DST day');
        test('2019-04-01 06:38:48 CEST', 'TimeSpanDay',   'TimeSpanDay switch @ 06:39 (CEST)');
        test('2019-04-01 19:38:48 CEST', 'TimeSpanNight', 'TimeSpanNight switch @ 19:39 (CEST)');

        // Perform long running timer test for year switch
        test('2019-12-31 23:58:48 CET',  'TimeEveryMinute', 'TimerPeriodic (1m) during year change', '', 4, 65000);

        // Perform long running regular timer test at DST boundaries
        test('2020-03-29 01:58:40 CET',  'TimeEveryMinute', 'TimerPeriodic (1m) during Winter->Summer DST change', '', 5, 70000);
        test('2020-10-25 02:58:40 CEST', 'TimeEveryMinute', 'TimerPeriodic (1m) during Summer->Winter DST change', '', 5, 70000);

        // Leap/non-leap year tests (Feb, 29. 2020, Feb, 28. 2021)
        test('2020-02-29 01:59:48 CET',  'Time0200',        'TimerFixed @ 02:00 last feb day (leap year)');
        test('2020-02-29 23:58:48 CET',  'TimeEveryMinute', 'TimerPeriodic (1m) feb month change (leap year)', '', 4, 70000);
        test('2021-02-28 23:58:48 CET',  'TimeEveryMinute', 'TimerPeriodic (1m) feb month change (non-leap year)', '', 4, 70000);

        // -> start of DST (winter->summer) in leap year
        test('2020-03-28 23:58:48 CET',  'TimeEveryMinute', 'TimerPeriodic (1m) during day change one day before Winter->Summer DST change', '', 5, 70000); // day switch before DST switchdate
        test('2020-03-29 00:59:48 CET',  'Time0100',        'TimerFixed @ 01:00 before Winter->Summer DST change');
        test('2020-03-29 01:29:48 CET',  'Time0130',        'TimerFixed @ 01:30 before Winter->Summer DST change');
        test('2020-03-29 01:54:48 CET',  'Time0155',        'TimerFixed @ 01:55 before Winter->Summer DST change');
        test('2020-03-29 01:59:48 CET',  'Time0200',        'TimerFixed @ 02:00 between Winter->Summer DST change');
        // test('2020-03-29 02:04:48 CET', 'Time0205'); // not in DST
        // test('2020-03-29 02:29:48 CET', 'Time0230'); // not in DST
        // test('2020-03-29 02:54:48 CET', 'Time0255'); // not in DST
        // test('2020-03-29 02:59:48 CET', 'Time0300'); // not in DST
        test('2020-03-29 03:04:48 CEST', 'Time0305',        'TimerFixed @ 03:05 after Winter->Summer DST change');
        test('2020-03-29 03:29:48 CEST', 'Time0330',        'TimerFixed @ 03:30 after Winter->Summer DST change');
        test('2020-03-29 23:58:48 CEST', 'TimeEveryMinute', 'TimerPeriodic (1m) during day change one day after Winter->Summer DST change', '', 5, 70000); // day switch after DST switchdate

        // -> end of DST (summer->winter) in leap year
        test('2020-10-24 23:58:48 CEST', 'TimeEveryMinute', 'TimerPeriodic (1m) during day change one day before Summer->Winter DST change', '', 5, 70000); // day switch before DST switchdate
        test('2020-10-25 00:59:48 CEST', 'Time0100',        'TimerFixed @ 01:00 before Summer->Winter DST change');
        test('2020-10-25 01:29:48 CEST', 'Time0130',        'TimerFixed @ 01:30 before Summer->Winter DST change');
        test('2020-10-25 01:54:48 CEST', 'Time0155',        'TimerFixed @ 01:55 before Summer->Winter DST change');
        test('2020-10-25 01:59:48 CEST', 'Time0200',        'TimerFixed @ 02:00 before Summer->Winter DST change');
        test('2020-10-25 02:04:48 CEST', 'Time0205',        'TimerFixed @ 02:05 before Summer->Winter DST change');
        test('2020-10-25 02:29:48 CEST', 'Time0230',        'TimerFixed @ 02:30 before Summer->Winter DST change');
        test('2020-10-25 02:54:48 CEST', 'Time0255',        'TimerFixed @ 02:55 before Summer->Winter DST change');
        // test('2020-10-25 02:59:48 CEST', 'Time0200',        'TimerFixed @ 02:00 between Summer->Winter DST change'); // @ 03:00 (CEST) time will be switch to 02:00 (CET), thus Time0200 should usually trigger (but this is not possible)
        // test('2020-10-25 02:04:48 CET', 'Time0205',         'TimerFixed @ 02:05 after Summer->Winter DST change'); // @ 02:05 (CET) is not possible in ReGaHss
        test('2020-10-25 02:59:48 CET', 'Time0300',         'TimerFixed @ 03:00 after Summer->Winter DST change');
        test('2020-10-25 03:04:48 CET', 'Time0305',         'TimerFixed @ 03:05 after Summer->Winter DST change');
        test('2020-10-25 03:29:48 CET', 'Time0330',         'TimerFixed @ 03:30 after Summer->Winter DST change');
        test('2020-10-25 23:58:48 CET', 'TimeEveryMinute',  'TimerPeriodic (1m) during day change one day after Summer->Winter DST change', '', 5, 70000); // day switch after DST switchdate
    });
});
