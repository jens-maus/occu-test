/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import */

const {
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
    flavors,
    indent
} = require('../lib/helper.js');

require('should');

flavors.forEach(flavor => {
    describe('rfd/hmipserver Simulator', () => {
        it('should start', () => {
            startSim();
        });
    });

    describe('ReGaHss' + flavor, () => {
        it('should start ReGaHss' + flavor, () => {
            startRega(flavor);
        });

        it('should do init on simulated rfd', function (done) {
            this.timeout(60000);
            subscribe('sim', /rpc rfd < init \["xmlrpc_bin:\/\/127\.0\.0\.1:1999","[0-9]+"]/, () => {
                done();
            });
        });
    });

    describe('virtual key triggers program', () => {
        it('should PRESS_LONG BidCoS-RF:2 when PRESS_SHORT BidCoS-RF:1 (program Key1)', function (done) {
            // BidCoS-RF:1 PRESS_SHORT is pressed by the simulator every 5 seconds
            this.timeout(90000);
            subscribe('sim', /setValue rfd BidCoS-RF:2 PRESS_LONG true/, () => {
                done();
            });
        });
    });

    describe('stop ReGaHss' + flavor + ' process', () => {
        it('should wait 10 seconds', function (done) {
            this.timeout(11000);
            setTimeout(done, 10000);
        });

        it('should stop', function (done) {
            this.timeout(60000);
            procs.rega.on('close', () => {
                procs.rega = null;
                done();
            });
            cp.spawnSync('killall', ['-s', 'SIGINT', 'ReGaHss' + flavor]);
        });

        /*
        It('should wait 5 seconds', function (done) {
            this.timeout(6000);
            setTimeout(done, 5000);
        });
        */
    });

    describe('stop simulator', () => {
        it('should stop', () => {
            procs.sim.kill();
        });
    });
});
