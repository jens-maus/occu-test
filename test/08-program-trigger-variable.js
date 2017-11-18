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

flavors.forEach(flavor => {

    describe('rfd/hmipserver Simulator', () => {
        it('should start', function () {
            startSim();
        });
    });

    describe('ReGaHss' + flavor, () => {

        it('should start ReGaHss' + flavor, () => {
            startRega(flavor);
        });
        it('should start HTTP server', function (done) {
            this.timeout(30000);
            subscribe('rega', /HTTP server started successfully/, () => {
                done();
            });
        });
        it('should wait 10 seconds', function (done) {
            this.timeout(11000);
            setTimeout(done, 10000);
        });
    });



    describe('variable change triggers program', () => {

        it('should PRESS_LONG BidCoS-RF:12 when VarBool1 changes to true (program Bool1OnTrue)', function (done) {
            this.timeout(7000);
            subscribe('sim', /setValue rfd BidCoS-RF:12 PRESS_LONG true/, () => {
                done();
            });
            rega.exec('var b1 = dom.GetObject(1237);\nb1.State(true);');
        });
        it('should PRESS_LONG BidCoS-RF:13 when VarBool1 changes to false (program Bool1OnTrue)', function (done) {
            this.timeout(7000);
            subscribe('sim', /setValue rfd BidCoS-RF:13 PRESS_LONG true/, () => {
                done();
            });
            rega.exec('var b1 = dom.GetObject(1237);\nb1.State(false);');
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
