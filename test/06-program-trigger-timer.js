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

    describe('ReGaHss' + flavor, () => {

        it('should start ReGaHss' + flavor, () => {
            startRega(flavor);
        });
        it('should wait 20 seconds', function (done) {
            this.timeout(21000);
            setTimeout(done, 20000);
        });
    });


    describe('timer triggers program', () => {
        /*
        TODO Implement https://github.com/wolfcw/libfaketime and set to 00:59 before starting rega, test edge cases DST and leap year

        it('should PRESS_LONG BidCoS-RF:11 at 01:00 (program Timer0100)', function (done) {
            this.timeout(60000);
            subscribe('sim', /BidCoS-RF:11/, () => {
                done();
            });
        });
           */


        it('should PRESS_LONG BidCoS-RF:50 every minute (program TimerEveryMinute)', function (done) {
            this.timeout(60000);
            subscribe('sim', /BidCoS-RF:50/, () => {
                done();
            });
        });
    });





    describe('stop ReGaHss' + flavor + ' process', () => {
        it('should wait 20 seconds', function (done) {
            this.timeout(21000);
            setTimeout(done, 20000);
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