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

        describe('testing that timer triggers virtual key', function () {
            it('should PRESS_LONG BidCoS-RF:50 every minute (program TimerEveryMinute)', function (done) {
                this.timeout(125000);
                subscribe('sim', /BidCoS-RF:50/, function () {
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
