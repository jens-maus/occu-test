/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, max-nested-callbacks, prefer-arrow-callback */

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
    describe('Running ' + __filename.split('/').reverse()[0] + ' test...', () => {
        describe('rfd/hmipserver Simulator', () => {
            it('should start', () => {
                startSim();
            });
        });

        describe('starting ReGaHss' + flavor, () => {
            it('should start', () => {
                startRega(flavor);
            });
            it('wait for HTTP server to be ready', function (done) {
                this.timeout(60000);
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

        describe('stopping ReGaHss' + flavor, () => {
            it('should stop', function (done) {
                this.timeout(60000);
                procs.rega.on('close', () => {
                    procs.rega = null;
                    done();
                });
                cp.spawnSync('killall', ['-9', 'ReGaHss' + flavor]);
            });
        });

        describe('stop simulator', () => {
            it('should stop', () => {
                procs.sim.kill();
            });
        });
    });
});
