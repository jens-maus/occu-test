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

flavors.forEach(flavor => {
    describe('rfd/hmipserver Simulator', () => {
        it('should start', () => {
            startSim();
        });
    });

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
        // Prevent problem that rega didn't stop after the tests...?!
        it('should wait 10 seconds', function (done) {
            if (flavor !== '.legacy') {
                return this.skip();
            }
            this.timeout(11000);
            setTimeout(done, 10000);
        });
    });

    describe('test examples from HM_Script_Teil_2_Objektmodell_V1.2.pdf', () => {
        it('3.1.3 should return date and time', function (done) {
            this.timeout(30000);
            rega.exec(`
string sDate = system.Date("%d.%m.%Y"); ! sDate = "24.12.2008";
string sTime = system.Date("%H:%M:%S"); ! sTime = "18:30:00";
            `, (err, output, objects) => {
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
}             `, (err, output, objects) => {
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
            `, (err, output, objects) => {
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
}             `, (err, output, objects) => {
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
}             `, (err, output, objects) => {
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
}             `, (err, output, objects) => {
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
}             `, (err, output, objects) => {
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
}             `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else {
                    output.should.equal('OK');
                    done();
                }
            });
        });
    });

    describe('stop ReGaHss' + flavor + ' process', () => {
        /*
        It('should wait 2 seconds', function (done) {
            this.timeout(3000);
            setTimeout(done, 2000);
        });
        */
        it('should stop', function (done) {
            this.timeout(60000);
            procs.rega.on('close', () => {
                procs.rega = null;
                done();
            });
            cp.spawnSync('killall', ['-s', 'SIGINT', 'ReGaHss' + flavor]);
        });
        /*
        It('should wait 2 seconds', function (done) {
            this.timeout(3000);
            setTimeout(done, 2000);
        });
        */
    });

    describe('stop simulator', () => {
        it('should stop', () => {
            procs.sim.kill();
        });
    });
});
