/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, max-nested-callbacks, prefer-arrow-callback, capitalized-comments */

const {
    cp,
    rega,
    subscribe,
    procs,
    simSubscriptions,
    simBuffer,
    regaSubscriptions,
    regaBuffer,
    flavors,
    indent,
    initTest,
    cleanupTest
} = require('../lib/helper.js');

require('should');

flavors.forEach(function (flavor) {
    describe('Running ' + __filename.split('/').reverse()[0] + ' [' + flavor + ']', function () {
        // initialize test environment
        initTest(flavor, false);

        describe('verify script error handling...', function () {
            it('should handle unknown methods', function (done) {
                if (!procs.rega) {
                    return this.skip();
                }
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
                if (!procs.rega) {
                    return this.skip();
                }
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
                if (!procs.rega) {
                    return this.skip();
                }
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
                if (flavor !== '.community' || !procs.rega) {
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
                if (!procs.rega) {
                    return this.skip();
                }
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

        // cleanup test environment
        cleanupTest(flavor);
    });
});
