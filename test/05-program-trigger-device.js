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
            it('should do init on simulated rfd', function (done) {
                this.timeout(60000);
                subscribe('sim', /rpc rfd < init \["xmlrpc_bin:\/\/127\.0\.0\.1:1999","[0-9]+"]/, function () {
                    done();
                });
            });
        });

        describe('test that virtual key triggers program', function () {
            it('should PRESS_LONG BidCoS-RF:2 when PRESS_SHORT BidCoS-RF:1 (program Key1)', function (done) {
                // BidCoS-RF:1 PRESS_SHORT is pressed by the simulator every 5 seconds
                this.timeout(90000);
                subscribe('sim', /setValue rfd BidCoS-RF:2 PRESS_LONG true/, function () {
                    done();
                });
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
