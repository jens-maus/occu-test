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
        describe('starting ReGaHss' + flavor, function () {
            it('should start', function () {
                startRega(flavor);
            });
            it('wait for HTTP server to be ready', function (done) {
                this.timeout(60000);
                subscribe('rega', /HTTP server started successfully/, function () {
                    if (flavor === '.legacy') {
                        setTimeout(done, 10000);
                    } else {
                        done();
                    }
                });
            });
        });

        describe('verify script error handling', function () {
            it('should handle unknown methods', function (done) {
                this.timeout(60000);
                subscribe('rega', /Error: IseESP::SyntaxError= Error 1 at row 2 col 27 near \^\("muh"\);/, function () {
                    done();
                });
                rega.exec(`
dom.MethodDoesNotExist("muh");
                `, function (err, stdout, objects) {
                    if (err) {
                        console.error(indent(err, 6));
                    }
                });
            });

            it('should handle syntax Errors', function (done) {
                this.timeout(60000);
                subscribe('rega', /Error: IseESP::SyntaxError= Error 1 at row 3 col 43 near/, function () {
                    done();
                });
                rega.exec(`

WriteLine(bla");
                `, function (err, stdout, objects) {
                    if (err) {
                        console.error(indent(err, 6));
                    }
                });
            });

            it('should handle illegal method invocation', function (done) {
                this.timeout(60000);

                if (flavor === '.legacy') {
                    subscribe('rega', /Error: IseESP::ExecError= Execution failed:/, function () {
                        done();
                    });
                } else {
                    subscribe('rega', /Error: IseESP::ScriptRuntimeError:/, function () {
                        done();
                    });
                }
                rega.exec(`
var unknown = dom.GetObject("doesNotExist");
WriteLine(unknown.Name());
                `, function (err, stdout, objects) {
                    if (err) {
                        console.error(indent(err, 6));
                    }
                });
            });

            it('should handle invalid method use', function (done) {
                if (flavor !== '.community') {
                    return this.skip();
                }
                this.timeout(60000);

                subscribe('rega', /Error: IseESP::ScriptRuntimeError:/, function () {
                    done();
                });

                rega.exec(`
var a = system.ToFloat();
var b = system.ToFloat("1.4");
var c = system.ToFloat("a");
                `, function (err, stdout, objects) {
                    if (err) {
                        console.error(indent(err, 6));
                    }
                });
            });

            it('should log division by zero', function (done) {
                this.timeout(60000);
                subscribe('rega', /Error: IseVar::Div - division by 0!/, function () {
                    done();
                });
                rega.exec(`
var one = 1;
var zero = 0;
var infinite  = one / zero;
WriteLine(infinite);
                `, function (err, stdout, objects) {
                    if (err) {
                        console.error(indent(err, 6));
                    }
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
    });
});
