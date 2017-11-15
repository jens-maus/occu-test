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
        it('should wait 15 seconds', function (done) {
            this.timeout(16000);
            setTimeout(done, 15000);
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
                } else if (
                    objects.sDate.match(/[0-9]{2}\.[0-9]{2}\.[0-9]{4}/) &&
                    objects.sTime.match(/[0-9]{2}:[0-9]{2}:[0-9]{2}/)
                ) {
                    done();
                } else {
                    done(new Error(objects.sDate + ' and/or ' + objects.sTime + ' dont match regex'));
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
                } else if (output === 'OK') {
                    done();
                } else {
                    done(new Error(output + ' != "OK"'));
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
                } else if (objects.myVar === '1' && objects.x === '2') {
                    done();
                } else {
                    done(new Error(objects.myVar + ' != 1 and/or ' + objects.x + ' != 2'));
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
                } else if (output === 'OK') {
                    done();
                } else {
                    done(new Error(output + ' != "OK"'));
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
                } else if (output === '1237') {
                    done();
                } else {
                    done(new Error(output + ' != 1237'));
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
                } else if (output === 'VarBool1') {
                    done();
                } else {
                    done(new Error(output + ' != "VarBool1"'));
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
                } else if (output === 'VARDP') {
                    done();
                } else {
                    done(new Error(output + ' != "VARDP"'));
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
                } else if (output === 'OK') {
                    done();
                } else {
                    done(new Error(output + ' != "OK"'));
                }
            });
        });

    });

    describe('stop ReGaHss' + flavor + ' process', () => {
        /*
        it('should wait 2 seconds', function (done) {
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
        it('should wait 2 seconds', function (done) {
            this.timeout(3000);
            setTimeout(done, 2000);
        });
        */
    });


    describe('stop simulator', () => {
        it('should stop', function () {
            procs.sim.kill();
        });
    });

});
