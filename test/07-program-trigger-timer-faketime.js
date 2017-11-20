let {
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

        describe('ReGaHss' + flavor + ': fake time test start (' + time + ')', function () {
            it('should fake datetime', function (done) {
                this.timeout(5 * 365 * 24 * 60 * 60 * 1000);
                cp.exec('sudo /bin/date -s "' + time + '" +"%Y-%m-%d %H:%M:%S %z (%Z) : %s"', function (e, stdout) {
                    if(!stdout || stdout.replace('\n', '').length === 0) {
                      done(new Error('invalid faketime: "' + time + '"'));
                    } else {
                      done();
                    }
                    console.log('      ' + stdout.replace('\n', ''));
                });
            });
            it('should start ReGaHss' + flavor, function (done) {
                this.timeout(15000);
                startRega(flavor);
                done();
            });
        });

        describe('ReGaHss' + flavor + ': rega output', function () {
            it('should output DST offset', function (done) {
                this.timeout(30000);
                subscribe('rega', /DST offset =/, output => {
                    console.log('      ' + output);
                    done();
                });
            });
            it('should output reference time', function (done) {
                this.timeout(30000);
                subscribe('rega', /GetNextTimer called for reference time/, output => {
                    console.log('      ' + output);
                    done();
                });
            });
        });

        describe('ReGaHss' + flavor + ': timer test (' + time + ')', function () {
            it('should call Program ID = ' + id + ' (program ' + program + ')', function (done) {
                this.timeout(20000);
                subscribe('rega', new RegExp('execute Program ID = ' + id), output => {
                    //console.log('    ' + output);
                    cp.exec('date', function (e, stdout) {
                      console.log('      ' + output);
                      done();
                    });
                });
            });
        });

        describe('ReGaHss' + flavor + ': stopping', function () {
            it('should stop', function (done) {
                this.timeout(7000);
                procs.rega.on('close', () => {
                    procs.rega = null;
                    done();
                });
                cp.spawnSync('killall', ['-s', 'SIGINT', 'ReGaHss' + flavor]);
            });
        });
    }


    test('2020-01-01 00:59:48 CET', 'Time0100', '1314');

    // leap year, Feb, 29. 2020
    test('2020-02-29 01:59:48 CET', 'Time0200', '1470');

    // -> start of DST (winter->summer) in leap year
    test('2020-03-29 00:59:48 CET', 'Time0100', '1314');
    test('2020-03-29 01:29:48 CET', 'Time0130', '1430');
    test('2020-03-29 01:54:48 CET', 'Time0155', '1458');
    test('2020-03-29 01:59:48 CET', 'Time0200', '1470');
    //test('2020-03-29 02:04:48 CET', 'Time0205', '1498'); // not in DST
    //test('2020-03-29 02:29:48 CET', 'Time0230', '1510'); // not in DST
    //test('2020-03-29 02:54:48 CET', 'Time0255', '1522'); // not in DST
    //test('2020-03-29 02:59:48 CET', 'Time0300', '1534'); // not in DST
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
    //test('2020-10-25 02:59:48 CEST', 'Time0300', '1534'); // @ 03:00 (CEST) time will be switch to 02:00 (CET) again, thus no Time0300 trigger (which is fine)
    test('2020-10-25 02:59:48 CET',  'Time0300', '1534');
    test('2020-10-25 03:04:48 CET',  'Time0305', '1546');
    test('2020-10-25 03:29:48 CET',  'Time0330', '1558');
});
