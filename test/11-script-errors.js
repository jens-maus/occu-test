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

    describe('ReGaHss' + flavor, () => {

        it('should start ReGaHss' + flavor, () => {
            startRega(flavor);
        });
        it('should start HTTP server', function (done) {
            this.timeout(60000);
            subscribe('rega', /HTTP server started successfully/, () => {
                done();
            });
        });
        if (flavor === '.legacy') {
            // Prevent problem that rega didn't stop after the tests...?!
            it('should wait 10 seconds', function (done) {
                this.timeout(11000);
                setTimeout(done, 10000);
            });
        }

    });

    describe('test script error handling', () => {
        it('should handle unknown methods', function (done) {
            this.timeout(30000);
            subscribe('rega', /Error: ParseProgram: SyntaxError/, () => {
                done();
            });
            rega.exec(`
dom.MethodDoesNotExist("muh");
            `);
        });

        it('should handle syntax Errors', function (done) {
            this.timeout(30000);
            subscribe('rega', /Error: ParseProgram: SyntaxError/, () => {
                done();
            });
            rega.exec(`
WriteLine(muh");
            `, (err, stdout, objects) => {
                //console.log(err, stdout, objects);
            });
        });

        it('should handle illegal method invocation', function (done) {
            this.timeout(30000);
            subscribe('rega', /Error: IseESP::ScriptRuntimeError/, () => {
                done();
            });
            rega.exec(`
var unknown = dom.GetObject("doesNotExist");
WriteLine(unknown.Name());
            `, (err, stdout, objects) => {
                //console.log(err, stdout, objects);
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


});
