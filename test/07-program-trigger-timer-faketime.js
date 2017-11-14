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
    regaBuffer
} = require('../lib/helper.js');

['', '.normal', '.community'].forEach(flavor => {

    function test(time, program, id) {
        describe('fake time test ' + time, function () {
            it('should start ReGaHss' + flavor, function (done) {
                this.timeout(5 * 365 * 24 * 60 * 60 * 1000);
                cp.exec('sudo /bin/date -s "' + time + '"', function (e, stdout) {
                    console.log('      ' + stdout.replace('\n', ''));
                    done();
                    startRega(flavor);
                });
            });
        });

        describe('rega output', function () {
            it('should output DST offset', function (done) {
                this.timeout(30000);
                subscribe('rega', /DST offset/, output => {
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

        describe('timer tests', function () {
            it('should call Program ID = ' + id + ' (program ' + program + ')', function (done) {
                this.timeout(20000);
                subscribe('rega', new RegExp('execute Program ID = ' + id), output => {
                    //console.log('    ' + output);
                    done();
                });
            });
        });

        describe('stop ReGaHss' + flavor + ' process', function () {
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


    test('2018-01-01 00:59:48', 'Time0100', '1314');

    // leap year, Feb, 29. 2020
    test('2020-02-29 01:59:48', 'Time0200', '1470');

    // -> start of DST in leap year
    test('2020-03-29 00:59:48', 'Time0100', '1314');
    test('2020-03-29 01:29:48', 'Time0130', '1430');
    test('2020-03-29 01:54:48', 'Time0155', '1458');
    test('2020-03-29 01:59:48', 'Time0200', '1470');
    test('2020-03-29 02:04:48', 'Time0205', '1498');
    test('2020-03-29 02:29:48', 'Time0230', '1510');
    test('2020-03-29 02:54:48', 'Time0255', '1522');
    test('2020-03-29 02:59:48', 'Time0300', '1534');
    test('2020-03-29 03:04:48', 'Time0305', '1546');
    test('2020-03-29 03:29:48', 'Time0330', '1558');

    // -> end of DST in leap year
    test('2020-10-25 00:59:48', 'Time0100', '1314');
    test('2020-10-25 01:30:48', 'Time0130', '1430');
    test('2020-10-25 01:54:48', 'Time0155', '1458');
    test('2020-10-25 01:59:48', 'Time0200', '1470');
    test('2020-10-25 02:04:48', 'Time0205', '1498');
    test('2020-10-25 02:29:48', 'Time0230', '1510');
    test('2020-10-25 02:54:48', 'Time0255', '1522');
    test('2020-10-25 02:59:48', 'Time0300', '1534');
    test('2020-10-25 03:04:48', 'Time0305', '1546');
    test('2020-10-25 03:29:48', 'Time0330', '1558');
});
