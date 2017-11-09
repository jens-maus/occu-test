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
            it('should start ReGaHss' + flavor, () => {
                startRega(flavor, time);
            });
        });

        describe('timer tests', () => {
            it('should call Program ID = ' + id + ' (program ' + program + ')', function (done) {
                this.timeout(90000);
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




  //  FIXME tests don't work :( Tests shitty or Rega Bug?

    test('2020-03-28 23:59:40', 'Time0100', '1314');
    test('2020-03-28 00:29:40', 'Time0130', '1430');
    test('2020-03-28 00:54:40', 'Time0155', '1458');
    test('2020-03-29 00:59:40', 'Time0200', '1470');
    test('2020-03-29 01:04:40', 'Time0205', '1478');
    test('2020-03-29 01:29:40', 'Time0230', '1510');
    test('2020-03-29 01:54:40', 'Time0255', '1522');
    test('2020-03-29 01:59:40', 'Time0300', '1534');
    test('2020-03-29 02:04:40', 'Time0305', '1546');
    test('2020-03-29 02:29:40', 'Time0330', '1558');

});