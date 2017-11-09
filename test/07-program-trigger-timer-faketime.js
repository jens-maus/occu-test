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
        describe('start ReGaHss' + flavor + ' faketime tests ' + time, () => {
            it('should set date', function (done) {
                cp.spawnSync('sudo', ['/bin/date', time], {stdio: 'inherit'});
                done();
            });
            it('should start ReGaHss' + flavor, () => {
                startRega(flavor);
            });
        });

        describe('timer tests', () => {
            it('should call Program ID = ' + id + ' (program ' + program + ')', function (done) {
                this.timeout(150000);
                subscribe('rega', new RegExp('execute Program ID = ' + id), output => {
                    console.log(output);
                    done();
                });
            });
        });


        describe('stop ReGaHss' + flavor + ' process', () => {
            it('should stop', function (done) {
                this.timeout(60000);
                procs.rega.on('close', () => {
                    procs.rega = null;
                    done();
                });
                cp.spawnSync('killall', ['-s', 'SIGINT', 'ReGaHss' + flavor]);
            });

        });
    }


    test('032823592020.40', 'Time0100', '1314');
    test('032900292020.40', 'Time0130', '1430');
    test('032900542020.40', 'Time0155', '1458');
    test('032900592020.40', 'Time0200', '1470');
    test('032901042020.40', 'Time0205', '1478');
    test('032901292020.40', 'Time0230', '1510');
    test('032901542020.40', 'Time0255', '1522');
    test('032901592020.40', 'Time0300', '1534');
    test('032902042020.40', 'Time0305', '1546');
    test('032902292020.40', 'Time0330', '1558');

});