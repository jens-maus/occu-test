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

flavors.forEach(function (flavor) {
    describe('Running ' + __filename.split('/').reverse()[0] + ' test...', function () {
        describe('rfd/hmipserver Simulator', function () {
            it('should start', function () {
                startSim();
            });
        });

        describe('starting ReGaHss' + flavor, function () {
            it('should start', function () {
                startRega(flavor);
            });
            it('wait for HTTP server to be ready', function (done) {
                this.timeout(60000);
                subscribe('rega', /HTTP server started successfully/, function () {
                    done();
                });
            });
            it('should wait 10 seconds', function (done) {
                this.timeout(11000);
                setTimeout(done, 10000);
            });
        });

        describe('variable change triggers program', function () {
            it('should PRESS_LONG BidCoS-RF:12 when VarBool1 changes to true (program Bool1OnTrue)', function (done) {
                this.timeout(7000);
                subscribe('sim', /setValue rfd BidCoS-RF:12 PRESS_LONG true/, function () {
                    done();
                });
                rega.exec('var b1 = dom.GetObject(1237);\nb1.State(true);');
            });
            it('should PRESS_LONG BidCoS-RF:13 when VarBool1 changes to false (program Bool1OnTrue)', function (done) {
                this.timeout(7000);
                subscribe('sim', /setValue rfd BidCoS-RF:13 PRESS_LONG true/, function () {
                    done();
                });
                rega.exec('var b1 = dom.GetObject(1237);\nb1.State(false);');
            });
        });

        describe('stopping ReGaHss' + flavor, function () {
            it('should stop', function (done) {
                this.timeout(60000);
                procs.rega.on('close', function () {
                    procs.rega = null;
                    done();
                });
                cp.spawnSync('killall', ['-9', 'ReGaHss' + flavor]);
            });
        });

        describe('stop simulator', function () {
            it('should stop', function () {
                procs.sim.kill();
            });
        });
    });
});
