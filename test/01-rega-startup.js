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

        it('should start TimerSchedulerThread', function (done) {
	        this.timeout(30000);
            subscribe('rega', /TimerSchedulerThread started/, () => {
                done();
            })
        });

        it('should init XmlRpcMethodListDevices', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodListDevices/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodNewDevices', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodNewDevices/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodDeleteDevices', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodDeleteDevices/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodReportValueUsage', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodReportValueUsage/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodUpdateDevice', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodUpdateDevice/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodReplaceDevice', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodReplaceDevice/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodSetReadyConfig', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodSetReadyConfig/, () => {
                done();
            });
        });

        it('should load /etc/config/homematic.regadom', function (done) {
            this.timeout(30000);
            subscribe('rega', /successfully loaded "\/etc\/config\/homematic\.regadom"/, () => {
                done();
            });
        });


        it('should start HTTP server', function (done) {
            this.timeout(30000);
            subscribe('rega', /HTTP server started successfully/, () => {
                done();
            });
        });

        it('should output build label', function (done) {
            this.timeout(30000);
            rega.exec(`
string build = dom.BuildLabel();
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.build !== 'undefined') {
                    done();
                    console.log('      ' + objects.build);
                } else {
                    done(new Error('dom.BuildLabel() returned error'));
                }
            });
        });


        it('should execute /bin/hm_startup', function (done) {
            if (flavor === '.legacy') {
                return this.skip();
            }
            this.timeout(30000);
            subscribe('rega', /Executing \/bin\/hm_startup/, () => {
                done();
            });
        });

        it('should do init on simulated rfd', function (done) {
            this.timeout(30000);
            subscribe('sim', /rpc rfd < init \["xmlrpc_bin:\/\/127\.0\.0\.1:1999","[0-9]+"]/, () => {
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
