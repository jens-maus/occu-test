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

[''/*, '.normal', '.community'*/].forEach(flavor => {


    function test(time, program, id) {
        describe('fake time test ' + time, () => {
            it('should start ReGaHss' + flavor, function (done) {
                this.timeout(6000);
                setTimeout(() => {
                    console.log('...');
                    done();
                }, 5000);
                console.log('sudo /bin/date ' + time);
                cp.exec('sudo /bin/date ' + time, {timeout: 2000, stdio: ['ignore', process.stdout, process.stdout]});
                startRega(flavor);
            });
        });


        describe('timer tests', () => {
            it('should call Program ID = ' + id + ' (program ' + program + ')', function (done) {
                this.timeout(15000);
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


    test('010123592018.52', 'Time0100', '1314');
    test('010100292018.52', 'Time0130', '1430');
    /*
    test('032823592020.52', 'Time0100', '1314');
    test('032900292020.52', 'Time0130', '1430');
    test('032900542020.52', 'Time0155', '1458');
    test('032900592020.52', 'Time0200', '1470');
    test('032901042020.52', 'Time0205', '1478');
    test('032901292020.52', 'Time0230', '1510');
    test('032901542020.52', 'Time0255', '1522');
    test('032901592020.52', 'Time0300', '1534');
    test('032902042020.52', 'Time0305', '1546');
    test('032902292020.52', 'Time0330', '1558');
*/
});