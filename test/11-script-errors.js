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
    });

    describe('test script error handling', () => {
        it('should handle unknown methods', function (done) {
            this.timeout(60000);
            subscribe('rega', /Error: IseESP::SyntaxError= Error 1 at row 2 col 27 near \^\("muh"\);/, () => {
                done();
            });
            rega.exec(`
dom.MethodDoesNotExist("muh");
            `);
        });

        it('should handle syntax Errors', function (done) {
            this.timeout(60000);
            subscribe('rega', /Error: IseESP::SyntaxError= Error 1 at row 3 col 39 near/, () => {
                done();
            });
            rega.exec(`

WriteLine(bla");
            `, (err, stdout, objects) => {
                //console.log(err, stdout, objects);
            });
        });

        it('should handle illegal method invocation', function (done) {
            this.timeout(60000);

            if(flavor !== '.legacy') {
                subscribe('rega', /Error: IseESP::ScriptRuntimeError:/, () => {
                    done();
                });
            } else {
                subscribe('rega', /Error: IseESP::ExecError= Execution failed:/, () => {
                    done();
                });
            }
            rega.exec(`
var unknown = dom.GetObject("doesNotExist");
WriteLine(unknown.Name());
            `, (err, stdout, objects) => {
                //console.log(err, stdout, objects);
            });
        });

        if(flavor === '.community') {
            it('should handle invalid method use', function (done) {
                this.timeout(60000);

                subscribe('rega', /Error: IseESP::ScriptRuntimeError:/, () => {
                    done();
                });

                rega.exec(`
var a = system.ToFloat();
var b = system.ToFloat("1.4");
var c = system.ToFloat("a");
                `, (err, stdout, objects) => {
                    //console.log(err, stdout, objects);
                });
            });
        }

        it('should log division by zero', function (done) {
            this.timeout(60000);
            subscribe('rega', /Error: IseVar::Div - division by 0!/, () => {
                done();
            });
            rega.exec(`
var one = 1;
var zero = 0;
var infinite  = one / zero;
WriteLine(infinite);
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
