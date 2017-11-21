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
    });

    describe('timer triggers program', () => {
        it('should PRESS_LONG BidCoS-RF:50 every minute (program TimerEveryMinute)', function (done) {
            this.timeout(125000);
            subscribe('sim', /BidCoS-RF:50/, () => {
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
    });

    describe('stop simulator', () => {
        it('should stop', () => {
            procs.sim.kill();
        });
    });
});
