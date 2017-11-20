/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, no-template-curly-in-string, camelcase */

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
                    if (flavor === '.legacy') {
                        setTimeout(done, 10000);
                    } else {
                        done();
                    }
                });
            });
        });

        describe('verifying bug fixes', () => {
            it('correct date/time output at DST boundaries', function (done) {
                if (flavor === '.legacy') {
                    return this.skip();
                }
                this.timeout(30000);
                rega.exec(`
var t0=@2016-10-30 01:59:57@;
var x0=t0.ToInteger();
var j=0;

WriteLine("");
while (j<3)
{
  var i=0;
  while(i<6)
  {
    var x1=x0+i+(j*3600);
    var t1=x1.ToTime();
    var lt=t1.IsLocalTime();
    var sz=t1.IsDST();
    var ts=t1.Format('%F %T %z %Z');
    WriteLine(x1#" "#lt#" "#sz#" "#ts);
    i=i+1;
  }
  j=j+1;
}
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        output.should.equal(`\r
1477785597 1 1 2016-10-30 01:59:57 +0200 CEST\r
1477785598 1 1 2016-10-30 01:59:58 +0200 CEST\r
1477785599 1 1 2016-10-30 01:59:59 +0200 CEST\r
1477785600 1 1 2016-10-30 02:00:00 +0200 CEST\r
1477785601 1 1 2016-10-30 02:00:01 +0200 CEST\r
1477785602 1 1 2016-10-30 02:00:02 +0200 CEST\r
1477789197 1 1 2016-10-30 02:59:57 +0200 CEST\r
1477789198 1 1 2016-10-30 02:59:58 +0200 CEST\r
1477789199 1 1 2016-10-30 02:59:59 +0200 CEST\r
1477789200 1 0 2016-10-30 02:00:00 +0100 CET\r
1477789201 1 0 2016-10-30 02:00:01 +0100 CET\r
1477789202 1 0 2016-10-30 02:00:02 +0100 CET\r
1477792797 1 0 2016-10-30 02:59:57 +0100 CET\r
1477792798 1 0 2016-10-30 02:59:58 +0100 CET\r
1477792799 1 0 2016-10-30 02:59:59 +0100 CET\r
1477792800 1 0 2016-10-30 03:00:00 +0100 CET\r
1477792801 1 0 2016-10-30 03:00:01 +0100 CET\r
1477792802 1 0 2016-10-30 03:00:02 +0100 CET\r
`);
                        done();
                    }
                });
            });

            it('empty line comment', function (done) {
                if (flavor === '.legacy') {
                    return this.skip();
                }
                this.timeout(30000);
                rega.exec(`
! Die nächste Zeile ist ein leerer Kommentar (erzeugt Fehler in Legacy version)
!
string MyString = "Hallo Welt!"; ! Dies ist ebenfalls ein Kommentar
               `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        objects.MyString.should.equal('Hallo Welt!');
                        done();
                    }
                });
            });

            it('can deal with unclosed <html tags', function (done) {
                if (flavor === '.legacy') {
                    return this.skip();
                }
                this.timeout(30000);
                rega.exec(`
string a = "Das ist ein <html & Test";
               `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        objects.a.should.equal('Das ist ein <html & Test');
                        done();
                    }
                });
            });

            it('should handle special chars in method call', function (done) {
                if (flavor === '.legacy') {
                    return this.skip();
                }
                this.timeout(30000);
                rega.exec(`
string a = "Hallo\\tWelt";
integer b = a.Find("\\t");
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        objects.a.should.equal('Hallo\tWelt');
                        objects.b.should.equal('5');
                        done();
                    }
                });
            });

            it('should be able to handle more than 200 variables', function (done) {
                if (flavor === '.legacy') {
                    return this.skip();
                }
                this.timeout(30000);
                let prg = '';
                let res = '';
                for (let i = 1; i <= 1000; i++) {
                    prg = prg + 'var i' + i + '=' + i + '; if(i' + i + '==' + i + ') { WriteLine(i' + i + '); }\n';
                    res = res + i + '\r\n';
                }
                rega.exec(prg, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        objects.i876.should.equal('876');
                        output.should.equal(res);
                        done();
                    }
                });
            });

            it('floating-point accuracy test', function (done) {
                if (flavor === '.legacy') {
                    return this.skip();
                }
                this.timeout(30000);
                rega.exec(`
real lReal1 = 0.7;
real lReal2 = 0.4;
real lReal3 = lReal1 - lReal2;
boolean diff1 = (lReal3 == 0.3);

real lReal4 = "1.1920928955078125E-07".ToFloat();
real lReal5 = lReal2 + lReal4;
boolean diff2 = (lReal2 != lReal5);

real lReal6 = "2.2204460492503131e-16".ToFloat();
real lReal7 = lReal2 + lReal6;
boolean diff3 = (lReal2 == lReal7);

boolean diff4 = (lReal3.ToString(20) == (0.3).ToString(30));
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        objects.diff1.should.equal('true');
                        objects.diff2.should.equal('true');
                        objects.diff3.should.equal('true');
                        objects.diff4.should.equal('true');
                        done();
                    }
                });
            });

            it('should allow object names starting with number', function (done) {
                if (flavor === '.legacy') {
                    return this.skip();
                }
                this.timeout(30000);
                rega.exec(`
object obj = dom.GetObject("2Light");
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        objects.obj.should.equal('null');
                        done();
                    }
                });
            });

            it('operand tests', function (done) {
                this.timeout(30000);
                rega.exec(`
WriteLine("");
Write("01: ");WriteLine("1" + 2);
Write("02: ");WriteLine(1 + 2);
Write("03: ");WriteLine(1 + "2");
Write("04: ");WriteLine(1 + "2" + 3);
Write("05: ");WriteLine(1 + 2 + "3");
Write("06: ");WriteLine(1 + "2" + "3");
Write("07: ");WriteLine("1" + 2 + 3);
Write("08: ");WriteLine("1" + 2 + "3");
Write("09: ");WriteLine("1" + "2" + 3);
Write("10: ");WriteLine("1" + "2" + "3");
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        output.should.equal(`\r
01: 12\r
02: 3\r
03: 3\r
04: 24\r
05: 6\r
06: 24\r
07: 15\r
08: 15\r
09: 123\r
10: 123\r
`);
                        done();
                    }
                });
            });

            it('adding fake objects to UserSharedObjects()', function (done) {
                if (flavor === '.legacy') {
                    return this.skip();
                }
                this.timeout(30000);
                rega.exec(`
object sysvar1 = dom.CreateObject(OT_VARDP, "Real-SysVarDP");
object sysvar2 = dom.CreateObject(OT_ALARMDP, "Real-AlarmDP");
object sysvar3 = dom.CreateObject(OT_DP, "Removed-DP");
dom.GetObject(ID_SYSTEM_VARIABLES).Add(sysvar1.ID());
dom.GetObject(ID_SYSTEM_VARIABLES).Add(sysvar2.ID());
dom.GetObject(ID_SYSTEM_VARIABLES).Add(sysvar3.ID());
object user = dom.GetObject(ID_USERS).Get("Admin");
user.UserSharedObjects().Add(sysvar1.ID());
user.UserSharedObjects().Add(sysvar2.ID());
user.UserSharedObjects().Add(sysvar3.ID());
user.UserSharedObjects().Add("33333");
user.UserSharedObjects().Add("33334");
user.UserSharedObjects().Add("33335");
user.UserSharedObjects().Add("33336");
dom.DeleteObject(sysvar3);
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        objects.containEql({
                            sysvar1: 'Real-SysVarDP',
                            sysvar2: 'Real-AlarmDP',
                            sysvar3: 'null',
                            user: 'Admin'
                        });
                        done();
                    }
                });
            });

            it('check that removed DP was removed from UserSharedObjects', function (done) {
                if (flavor === '.legacy') {
                    return this.skip();
                }
                this.timeout(30000);
                rega.exec(`
object user = dom.GetObject('Admin');
string objID;
foreach(objID, user.UserSharedObjects())
{
  object obj = dom.GetObject(objID);
  object sysVarObj = dom.GetObject(ID_SYSTEM_VARIABLES).Get(objID);
  if((!obj) || (!sysVarObj) || ((obj.Type() != OT_VARDP) && (obj.Type() != OT_ALARMDP)))
  {
    WriteLine(objID);
  }
}
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        output.should.equal('33333\r\n33334\r\n33335\r\n33336\r\n');
                        done();
                    }
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
