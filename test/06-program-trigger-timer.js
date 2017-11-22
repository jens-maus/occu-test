/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, prefer-arrow-callback */

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

flavors.forEach(function (flavor) {
    describe('rfd/hmipserver Simulator', function () {
        it('should start', function () {
            startSim();
        });
    });

    describe('ReGaHss' + flavor, function () {
        it('should start ReGaHss' + flavor, function () {
            startRega(flavor);
        });
    });

    describe('timer triggers program', function () {
        it('should PRESS_LONG BidCoS-RF:50 every minute (program TimerEveryMinute)', function (done) {
            this.timeout(125000);
            subscribe('sim', /BidCoS-RF:50/, function () {
                done();
            });
        });
    });

    describe('stop ReGaHss' + flavor + ' process', function () {
        it('should wait 5 seconds', function (done) {
            this.timeout(6000);
            setTimeout(done, 5000);
        });

        it('should stop', function (done) {
            this.timeout(60000);
            procs.rega.on('close', function () {
                procs.rega = null;
                done();
            });
            cp.spawnSync('killall', ['-s', 'SIGINT', 'ReGaHss' + flavor]);
        });
    });

    describe('stop simulator', function () {
        it('should stop', function () {
            procs.sim.kill();
        });
    });
});
