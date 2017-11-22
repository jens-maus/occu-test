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
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodListDevices/, function() {
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
                    console.log(indent(objects.build, 6));
                }
            });
        });

        it('should execute /bin/hm_startup', function (done) {
            this.timeout(30000);
            subscribe('rega', /\/bin\/hm_startup executed/, function () {
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

    describe('stop ReGaHss' + flavor + ' process', function () {
        it('should wait 10 seconds', function (done) {
            this.timeout(11000);
            setTimeout(done, 10000);
        });

        it('should stop', function (done) {
            this.timeout(60000);
            procs.rega.on('close', function () {
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

    describe('stop simulator', function () {
        it('should stop', function () {
            procs.sim.kill();
        });
    });
});
