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
                cp.exec('cat /etc/timezone', function (e, stdout) {
                   console.log('timezone: ' + stdout);
                cp.exec('sudo /bin/date ' + time, function (e, stdout) {
                    console.log('      ' + stdout.replace('\n', ''));
                    done();
                    startRega(flavor);
                });});
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


    test('010123592018.48', 'Time0100', '1314');

    // leap year, Feb, 29.
    test('022900592020.48', 'Time0200', '1470');

    // -> start of DST in leap year
    test('032823592020.48', 'Time0100', '1314');
    test('032900292020.48', 'Time0130', '1430');
    test('032900542020.48', 'Time0155', '1458');
    test('032900592020.48', 'Time0200', '1470');
    test('032901042020.48', 'Time0205', '1498');
    test('032901292020.48', 'Time0230', '1510');
    test('032901542020.48', 'Time0255', '1522');
    test('032901592020.48', 'Time0300', '1534');
    test('032902042020.48', 'Time0305', '1546');
    test('032902292020.48', 'Time0330', '1558');

    // -> end of DST in leap year
    test('102423592020.48', 'Time0100', '1314');
    test('102500292020.48', 'Time0130', '1430');
    test('102500542020.48', 'Time0155', '1458');
    test('102500592020.48', 'Time0200', '1470');
    test('102501042020.48', 'Time0205', '1498');
    test('102501292020.48', 'Time0230', '1510');
    test('102501542020.48', 'Time0255', '1522');
    test('102501592020.48', 'Time0300', '1534');
    test('102502042020.48', 'Time0305', '1546');
    test('102502292020.48', 'Time0330', '1558');
});
