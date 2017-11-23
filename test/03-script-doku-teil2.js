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
        initTest(flavor);

        // run tests
        describe('running examples from HM_Script_Teil_2_Objektmodell...', function () {
            it('3.1.3 should return date and time', function (done) {
                this.timeout(30000);
                rega.exec(`
string sDate = system.Date("%d.%m.%Y"); ! sDate = "24.12.2008";
string sTime = system.Date("%H:%M:%S"); ! sTime = "18:30:00";
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        objects.sDate.should.match(/[0-9]{2}\.[0-9]{2}\.[0-9]{4}/);
                        objects.sTime.should.match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/);
                        done();
                    }
                });
            });

            it('3.2.3 should return true on system.IsVar()', function (done) {
                this.timeout(30000);
                rega.exec(`
var MY_DEFINE = 1;

if (system.IsVar("MY_DEFINE"))
{
    Write('OK');
}
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        output.should.equal('OK');
                        done();
                    }
                });
            });

            it('3.3.3 should utilize system.GetVar()', function (done) {
                this.timeout(30000);
                rega.exec(`
var myVar = 1;

if (system.IsVar("myVar"))
{
 var x = system.GetVar("myVar");
 x = x + 1;
}

! myVar = 1
! x = 2          
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        objects.myVar.should.equal('1');
                        objects.x.should.equal('2');
                        done();
                    }
                });
            });

            it('4.2 (VarBool1) should do dom.GetObject()', function (done) {
                this.timeout(30000);
                rega.exec(`
var myObject = dom.GetObject("VarBool1");
if (myObject)
{
    Write("OK");
}
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        output.should.equal('OK');
                        done();
                    }
                });
            });

            it('4.3 (VarBool1) should do .ID()', function (done) {
                this.timeout(30000);
                rega.exec(`
var myObject = dom.GetObject("VarBool1");
if (myObject)
{
    Write(myObject.ID());
}
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        output.should.equal('1237');
                        done();
                    }
                });
            });

            it('4.4 (VarBool1) should do .Name()', function (done) {
                this.timeout(30000);
                rega.exec(`
var myObject = dom.GetObject("VarBool1");
if (myObject)
{
    Write(myObject.Name());
}
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        output.should.equal('VarBool1');
                        done();
                    }
                });
            });

            // TODO 4.5 .Type()

            it('4.6 (VarBool1) should do .TypeName()', function (done) {
                this.timeout(30000);
                rega.exec(`
var myObject = dom.GetObject("VarBool1");
if (myObject)
{
    Write(myObject.TypeName());
}
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        output.should.equal('VARDP');
                        done();
                    }
                });
            });

            it('4.7 (VarBool1) should do .IsTypeOf()', function (done) {
                this.timeout(30000);
                rega.exec(`
var myObject = dom.GetObject("VarBool1");
if (myObject.IsTypeOf(OT_VARDP))
{
    Write("OK");
}
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        output.should.equal('OK');
                        done();
                    }
                });
            });
        });

        // cleanup test environment
        cleanupTest(flavor);
    });
});
