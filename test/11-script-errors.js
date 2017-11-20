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

require('should');

flavors.forEach(flavor => {

    describe('Running ' + __filename.split('/').reverse()[0] + ' test...', () => {

        describe('starting ReGaHss' + flavor, () => {
            it('should start', () => {
                startRega(flavor);
            });
            it('wait for HTTP server to be ready', function (done) {
                this.timeout(60000);
                subscribe('rega', /HTTP server started successfully/, () => {
                    if (flavor == '.legacy') {
                        setTimeout(done, 10000);
                    } else {
                        done();
                    }
                });
            });
        });

        describe('verify script error handling', () => {
            it('should handle unknown methods', function (done) {
                this.timeout(60000);
                subscribe('rega', /Error: IseESP::SyntaxError= Error 1 at row 2 col 27 near \^\("muh"\);/, () => {
                    done();
                });
                rega.exec(`
dom.MethodDoesNotExist("muh");
                `, (err, stdout, objects) => {
                    //console.log(err, stdout, objects);
                });
            });
    
            it('should handle syntax Errors', function (done) {
                this.timeout(60000);
                subscribe('rega', /Error: IseESP::SyntaxError= Error 1 at row 3 col 43 near/, () => {
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
    
                if (flavor !== '.legacy') {
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

            it('should handle invalid method use', function (done) {
                if (flavor !== '.community') {
                    return this.skip();
                }
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
    });
});
