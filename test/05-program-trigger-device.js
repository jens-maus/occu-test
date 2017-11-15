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

['.legacy', '.normal', '.community'].forEach(flavor => {

    describe('rfd/hmipserver Simulator', () => {
        it('should start', function () {
            startSim();
        });
    });

    describe('ReGaHss' + flavor, () => {

        it('should start ReGaHss' + flavor, () => {
            startRega(flavor);
        });
        it('should wait 15 seconds', function (done) {
            this.timeout(16000);
            setTimeout(done, 15000);
        });
    });




    describe('virtual key triggers program', () => {
        it('should PRESS_LONG BidCoS-RF:2 when PRESS_SHORT BidCoS-RF:1 (program Key1)', function (done) {
            // BidCoS-RF:1 PRESS_SHORT is pressed by the simulator every 5 seconds
            this.timeout(12000);
            subscribe('sim', /setValue rfd BidCoS-RF:2 PRESS_LONG true/, () => {
                done();
            });
        });
    });



    describe('stop ReGaHss' + flavor + ' process', () => {
        /*
        it('should wait 5 seconds', function (done) {
            this.timeout(6000);
            setTimeout(done, 5000);
        });
        */

        it('should stop', function (done) {
            this.timeout(60000);
            procs.rega.on('close', () => {
                procs.rega = null;
                done();
            });
            cp.spawnSync('killall', ['-s', 'SIGINT', 'ReGaHss' + flavor]);
        });

        /*
        it('should wait 5 seconds', function (done) {
            this.timeout(6000);
            setTimeout(done, 5000);
        });
        */
    });


    describe('stop simulator', () => {
        it('should stop', function () {
            procs.sim.kill();
        });
    });

});
