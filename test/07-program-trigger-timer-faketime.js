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

    describe('rfd/hmipserver Simulator', () => {
        it('should start', function () {
            startSim();
        });
    });


    describe('start ReGaHss' + flavor + ' faketime tests 2020-03-29 00:59:30 (leap year, begin of DST)', () => {
        it('should start ReGaHss' + flavor, () => {
            startRega(flavor, '2020-03-29 00:59:30');
        });
        it('should wait 15 seconds', function (done) {
            this.timeout(16000);
            setTimeout(done, 15000);
        });

    });

    describe('timer tests', () => {
        it('should PRESS_LONG BidCoS-RF:11 at 01:00 (program Timer0100)', function (done) {
            this.timeout(60000);
            subscribe('sim', /BidCoS-RF:11/, () => {
                done();
            });
        });
    });


    describe('stop ReGaHss' + flavor + ' process', () => {
        it('should wait 5 seconds', function (done) {
            this.timeout(6000);
            setTimeout(done, 5000);
        });

        it('should stop', function (done) {
            this.timeout(60000);
            procs.rega.on('close', () => {
                procs.rega = null;
                done();
            });
            cp.spawnSync('killall', ['-s', 'SIGINT', 'ReGaHss' + flavor]);
        });

        it('should wait 5 seconds', function (done) {
            this.timeout(6000);
            setTimeout(done, 5000);
        });
    });


    describe('stop simulator', () => {
        it('should stop', function () {
            procs.sim.kill();
        });
    });

});