/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, prefer-arrow-callback, max-nested-callbacks */

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

            it('should start TimerSchedulerThread', function (done) {
                this.timeout(30000);
                subscribe('rega', /TimerSchedulerThread started/, function () {
                    done();
                });
            });

            it('should start IseRTPrgThread', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: IseRTPrgThread thread function started/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodListDevices', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodListDevices/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodNewDevices', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodNewDevices/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodDeleteDevices', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodDeleteDevices/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodReportValueUsage', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodReportValueUsage/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodUpdateDevice', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodUpdateDevice/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodReplaceDevice', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodReplaceDevice/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodSetReadyConfig', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodSetReadyConfig/, function () {
                    done();
                });
            });

            it('should load /etc/config/homematic.regadom', function (done) {
                this.timeout(30000);
                subscribe('rega', /successfully loaded "\/etc\/config\/homematic\.regadom"/, function () {
                    done();
                });
            });

            it('should start HTTP server', function (done) {
                this.timeout(30000);
                subscribe('rega', /HTTP server started successfully/, function () {
                    done();
                });
            });

            it('should output build label', function (done) {
                this.timeout(30000);
                rega.exec(`
string build = dom.BuildLabel();
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        objects.build.should.not.equal('undefined');
                        done();
                        console.log(indent(objects.build, 8));
                    }
                });
            });

            it('should execute /bin/hm_startup', function (done) {
                if (flavor === '.legacy') {
                    return this.skip();
                }
                this.timeout(30000);
                subscribe('rega', /Executing \/bin\/hm_startup/, function () {
                    done();
                });
            });

            it('should do init on simulated rfd', function (done) {
                this.timeout(30000);
                subscribe('sim', /rpc rfd < init \["xmlrpc_bin:\/\/127\.0\.0\.1:1999","[0-9]+"]/, function () {
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
