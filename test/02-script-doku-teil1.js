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

    describe('test examples from HM-Skript_Teil_1_Sprachbeschreibung_V2.0', () => {
        it('2.2 should handle comments', function (done) {
            this.timeout(30000);
            rega.exec(`
! Dies ist ein Kommentar.
string MyString = "Hallo Welt!"; ! Dies ist ebenfalls ein Kommentar
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.MyString === 'Hallo Welt!') {
                    done();
                } else {
                    done(new Error(objects.MyString + ' != "Hallo Welt!"'));
                }
            });
        });

        it('3.2 should declare and initialize variables', function (done) {
            this.timeout(30000);
            rega.exec(`
integer i; ! Deklaration ohne Initialisierung
integer j = 1; ! Deklaration mit Initialisierung
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.j === '1') {
                    done();
                } else {
                    done(new Error(objects.j + ' != "1"'));
                }
            });
        });

        it('3.3 should dynamically change type', function (done) {
            this.timeout(30000);
            rega.exec(`
integer i = "Hallo Welt!"; ! i ist eine Zeichenkette
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.i === 'Hallo Welt!') {
                    done();
                } else {
                    done(objects.i + ' != "Hallo Welt!"');
                }
            });
        });

        it('4.0 should handle operators correctly', function (done) {
            this.timeout(30000);
            rega.exec(`
var i = 1; ! i=1
var j = i + 1;  ! j=2
var k = i - 1;  ! k=0
var l = i * 10; ! l=10
real m = i / 10; ! m=0
boolean b = (i == 1); ! b=true
boolean c = (i <> 1); ! c=false
boolean d = (i != 1); ! d=false
boolean e = (i < 1);  ! e=false
boolean f = (i <= 1); ! f=true
boolean g = (i > 1);  ! g=false
boolean h = (i >= 1); ! h=true
boolean n = (b && true); ! n=true
boolean o = (b || true); ! o=true
boolean p = !b; ! p=false
integer q = i & 1; ! q=1
integer r = i | 1; ! r=1
string s = "Hallo" # "Welt"; ! s="HalloWelt"
boolean t = system.IsVar("i"); ! t=true
integer u = i % 3; ! u=1
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.i === '1' &&
                           objects.j === '2' &&
                           objects.k === '0' &&
                           objects.l === '10' &&
                           objects.m === '0' &&
                           objects.b === 'true' &&
                           objects.c === 'false' &&
                           objects.d === 'false' &&
                           objects.e === 'false' &&
                           objects.f === 'true' &&
                           objects.g === 'false' &&
                           objects.h === 'true' &&
                           objects.n === 'true' &&
                           objects.o === 'true' &&
                           objects.p === 'false' &&
                           objects.q === '1' &&
                           objects.r === '1' &&
                           objects.s === 'HalloWelt' &&
                           objects.t === 'true' &&
                           objects.u === '1') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('4.1 should do right to left interpretation', function (done) {
            this.timeout(30000);
            rega.exec(`
integer i = 1 + 2 * 3; ! i = (3 * 2) + 1 = 7
integer j = 3 * 2 + 1; ! j = (1 + 2) * 3 = 9
integer k = (3 * 2) + 1; ! k = 1 + (3 * 2) = 7
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.i === '7' && objects.j === '9' && objects.k === '7') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('4.2.0 should cast to left operands type', function (done) {
            this.timeout(30000);
            rega.exec(`
var x = 1 / 10.0; ! x = 0; x ist eine Ganzzahl
var y = 1.0 / 10; ! y = 0.1; y ist eine Gleitkommazahl
var z = 1.0 + "1.0"; ! z == 2.0
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.x === '0' &&
                           objects.y === '0.100000' &&
                           objects.z === '2.000000') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('4.2.1 should cast to left operands type', function (done) {
            this.timeout(30000);
            rega.exec(`
var a = 3 * 2.5; ! a = 6; a ist eine Ganzzahl
var b = 2.5 * 3; ! b = 7.5; b ist eine Gleitkommazahl
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.a === '6' && objects.b === '7.500000') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });


        it('4.2.2 should cast to left operands type', function (done) {
            this.timeout(30000);
            rega.exec(`
var c = 0.0 + 3; ! c = 3.0; c ist eine Gleitkommazahl
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.c === '3.000000') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('5.1 should do if else', function (done) {
            this.timeout(30000);
            rega.exec(`
integer i = 1;
string s;
if (i == 1) { s = "i == 1"; }
else { s = "i != 1"; }
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.s === 'i == 1') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        if (flavor !== '.legacy') {
            it('5.1.1 should be able to handle elseif()', function (done) {
                this.timeout(30000);
                rega.exec(`
integer i = 2;
string s;
if (i == 1) { s = "i == 1"; }
elseif (i == 2) { s = "i == 2"; }
else { s = "i != 1 && i != 2"; }
integer x = 3;
integer y = 1;
if (y==1) {
  if (x == 1) { y = 2; }
  elseif (x == 2) { y = 3; }
  elseif (x == 3) { y = 4; }
  elseif (x == 4) { y = 5; }
  elseif (x == 5) { y = 6; }
  elseif (x == 6) { y = 7; }
  elseif (x == 7) { y = 8; }
  else { y = 9; }
  x=10;
}
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.s === 'i == 2' &&
                               objects.x === '10' &&
                               objects.y === '4') {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });
        }

        it('5.2 should terminate while(true) after max iterations', function (done) {
            this.timeout(30000);
            rega.exec(`
integer i = 0;
while (true) { i = i + 1; }
        `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else {
                    if (flavor === '.legacy') {
                        objects.i.should.equal('5001');
                    } else {
                        objects.i.should.equal('500001');
                    }
                    done();
                }
            });
        });

        it('5.3 should do foreach', function (done) {
            this.timeout(30000);
            rega.exec(`
string liste = "a\\tb\\tc"; ! Liste { "a", "b", "c" }
string ausgabe = ""; ! Ausgabe
string index; ! Indexvariable 
foreach (index, liste)
{
    ausgabe = index # ausgabe;
}
! ausgabe = "cba";
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.ausgabe === 'cba') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });


        it('5.4 should quit a script', function (done) {
            this.timeout(30000);
            rega.exec(`
integer even = 3;
if (even & 1) { quit; } ! "even" ist nicht gerade -> Abbruch
boolean didNotQuit = true;
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.even === '3' && objects.didNotQuit !== 'true') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        if (flavor !== '.community') {
            it('6.1.1 should determine VarType() (legacy/standard)', function (done) {
                this.timeout(30000);
                rega.exec(`
boolean b;
integer bType = b.VarType(); ! 1;

integer i;
integer iType = i.VarType(); ! 2;

real r;
integer rType = r.VarType(); ! 3;

string s;
integer sType = s.VarType(); ! 4;

time t;
integer tType = t.VarType(); ! 5

            `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (
                        objects.bType === '1' &&
                        objects.iType === '2' &&
                        objects.rType === '3' &&
                        objects.sType === '4' &&
                        objects.tType === '5'
                    ) {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });

        } else {
            it('6.1.1 should determine VarType() (community)', function (done) {
                this.timeout(30000);
                rega.exec(`
var v;
integer vType = v.VarType(); ! 0;                
                
boolean b;
integer bType = b.VarType(); ! 1;

integer i;
integer iType = i.VarType(); ! 2;

real r;
integer rType = r.VarType(); ! 3;

string s;
integer sType = s.VarType(); ! 4;

time t;
integer tType = t.VarType(); ! 5

object o;
integer oType = o.VarType(); ! 9

idarray d;
integer dType = d.VarType(); ! 10

            `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (
                        objects.vType === '0' &&
                        objects.bType === '1' &&
                        objects.iType === '2' &&
                        objects.rType === '3' &&
                        objects.sType === '4' &&
                        objects.tType === '5' &&
                        objects.oType === '9' &&
                        objects.dType === '10'
                    ) {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });
        }

        it('6.1.2 should do ToString()', function (done) {
            this.timeout(30000);
            rega.exec(`
var i = 1.23456;
var s = i.ToString(3); ! s = "1.235"; s ist eine Zeichenkette
var r = s.ToString(1); ! r = "1.2"; r ist eine Zeichenkette
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.i === '1.234560' &&
                           objects.s === '1.235' &&
                           objects.r === (flavor !== '.legacy') ? '1.2' : '1.235') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.1.2.1 should do ToString() on time', function (done) {
            this.timeout(30000);
            rega.exec(`
time t = @2008-12-24 18:30:00@;
string sDate = t.ToString("%d.%m.%Y"); ! sDate = "24.12.2008";
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.sDate === '24.12.2008') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.1.3 should do ToInteger()', function (done) {
            this.timeout(30000);
            rega.exec(`
var s = "100";
var i = s.ToInteger(); ! i = 100; i ist eine Ganzzahl
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.s === '100') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.1.4 should do ToTime()', function (done) {
            this.timeout(30000);
            rega.exec(`
var i = 1;
var t = i.ToTime(); ! t = @1970-01-01 01:00:01@ (CET)
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.t === '1970-01-01 01:00:01') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.2 should handle boolean values', function (done) {
            this.timeout(30000);
            rega.exec(`
boolean bTRUE = true;
boolean bFALSE = false;
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.bTRUE === 'true' &&
                           objects.bFALSE === 'false') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.3 should handle negative integers', function (done) {
            this.timeout(30000);
            rega.exec(`
integer i = -123;
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.i === '-123') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.4 should handle real values', function (done) {
            this.timeout(30000);
            rega.exec(`
real r = 1.0;
real s = "-1.0E-1".ToFloat(); ! -0.1
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.r === '1.000000' &&
                           objects.s === '-0.100000') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.5.1 should do Year(), Month(), Day(), ...', function (done) {
            this.timeout(30000);
            rega.exec(`
time t = @2008-12-24 18:30:00@;
integer year = t.Year(); ! year = 2008
integer month = t.Month(); ! month = 12
integer day = t.Day(); ! day = 24
integer hour = t.Hour(); ! hour = 18
integer minute = t.Minute(); ! minute = 30
integer second = t.Second(); ! second = 0
integer week = t.Week(); ! week = 51
integer weekday = t.Weekday(); ! weekday = 4
integer yearday = t.Yearday(); ! yearday = 359
integer isLocalTime = t.IsLocalTime(); ! isLocalTime = 1
integer isDST = t.IsDST(); ! isDST = 0
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (
                    objects.t === '2008-12-24 18:30:00' &&
                    objects.year === '2008' &&
                    objects.month === '12' &&
                    objects.day === '24' &&
                    objects.hour === '18' &&
                    objects.minute === '30' &&
                    objects.second === '0' &&
                    objects.week === '51' &&
                    objects.weekday === '4' &&
                    objects.yearday === '359' &&
                    objects.isLocalTime === '1' &&
                    objects.isDST === '0'
                ) {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.5.2 should do date/time Format()', function (done) {
            this.timeout(30000);
            rega.exec(`
time t = @2008-12-24 18:30:00@;
string perc = t.Format("%%");   ! perc = "%"
string lowerA = t.Format("%a"); ! lowerA = "Wed"
string upperA = t.Format("%A"); ! upperA = "Wednesday"
string lowerB = t.Format("%b"); ! lowerB = "Dec"
string upperB = t.Format("%B"); ! upperB = "December"
string lowerC = t.Format("%c"); ! lowerC = "Wed Dec 24 18:30:00 2008"
string upperC = t.Format("%C"); ! upperC = "20"
string lowerD = t.Format("%d"); ! lowerD = "24"
string upperD = t.Format("%D"); ! upperD = "12/24/08"
string upperF = t.Format("%F"); ! upperF = "2008-12-24"
string lowerH = t.Format("%h"); ! lowerH = "Dec"
string upperH = t.Format("%H"); ! upperH = "18"
string upperI = t.Format("%I"); ! upperI = "06"
string lowerJ = t.Format("%j"); ! lowerJ = "359"
string lowerM = t.Format("%m"); ! lowerM = "12"
string upperM = t.Format("%M"); ! upperM = "30"
string lowerN = t.Format("%n"); ! lowerN = "<NEWLINE>"
string lowerP = t.Format("%p"); ! lowerP = "PM"
string lowerR = t.Format("%r"); ! lowerR = "06:30:00 PM"
string upperS = t.Format("%S"); ! upperS = "00"
string lowerT = t.Format("%t"); ! lowerT = "<TAB>"
string upperT = t.Format("%T"); ! upperT = "18:30:00"
string lowerU = t.Format("%u"); ! lowerU = "3"
string upperU = t.Format("%U"); ! upperU = "51"
string upperV = t.Format("%V"); ! upperV = "52"
string lowerW = t.Format("%w"); ! lowerW = "3"
string upperW = t.Format("%W"); ! upperW = "51"
string lowerX = t.Format("%x"); ! lowerX = "12/24/08"
string upperX = t.Format("%X"); ! upperX = "18:30:00"
string lowerY = t.Format("%y"); ! lowerY = "08"
string upperY = t.Format("%Y"); ! upperY = "2008"
string lowerZ = t.Format("%z"); ! lowerZ = "+0100"
string upperZ = t.Format("%Z"); ! upperZ = "CET"
string sDate = t.Format("%d.%m.%Y"); ! sDate = "24.12.2008"
string sTime = t.Format("%H:%M:%S"); ! sTime = "18:30:00"
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.perc === '%' &&
                           objects.lowerA === 'Wed' &&
                           objects.upperA === 'Wednesday' &&
                           objects.lowerB === 'Dec' &&
                           objects.upperB === 'December' &&
                           objects.lowerC === 'Wed Dec 24 18:30:00 2008' &&
                           objects.upperC === '20' &&
                           objects.lowerD === '24' &&
                           objects.upperD === '12/24/08' &&
                           objects.upperF === '2008-12-24' &&
                           objects.lowerH === 'Dec' &&
                           objects.upperH === '18' &&
                           objects.upperI === '06' &&
                           objects.lowerJ === '359' &&
                           objects.lowerM === '12' &&
                           objects.upperM === '30' &&
                           objects.lowerN === '\n' &&
                           objects.lowerP === 'PM' &&
                           objects.lowerR === '06:30:00 PM' &&
                           objects.upperS === '00' &&
                           objects.lowerT === '\t' &&
                           objects.upperT === '18:30:00' &&
                           objects.lowerU === '3' &&
                           objects.upperU === '51' &&
                           objects.upperV === '52' &&
                           objects.lowerW === '3' &&
                           objects.upperW === '51' &&
                           objects.lowerX === '12/24/08' &&
                           objects.upperX === '18:30:00' &&
                           objects.lowerY === '08' &&
                           objects.upperY === '2008' &&
                           objects.lowerZ === '+0100' &&
                           objects.upperZ === 'CET' &&
                           objects.sDate === '24.12.2008' &&
                           objects.sTime === '18:30:00') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.6 should output Hello World', function (done) {
            this.timeout(30000);
            rega.exec('string x = "Hello";\nWriteLine(x # " World!");', (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (output === 'Hello World!\r\n') {
                    done();
                } else {
                    done(new Error(output));
                }
            });
        });

        it('6.6.1 should correctly deal with escape chars', function (done) {
            this.timeout(30000);
            rega.exec(`
string a = "xxx\\\\xxx";
string b = "xxx\\\"xxx";
string c = "xxx\\\'xxx";
string d = "xxx\\txxx";
string e = "xxx\\nxxx";
string f = "xxx\\rxxx";
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.a === 'xxx\\\\xxx' && // FIXME: should only be 'xxx\\xxx' ReGa Bug?
                           objects.b === 'xxx"xxx'    &&
                           objects.c === 'xxx\'xxx'   &&
                           objects.d === 'xxx\txxx'   &&
                           objects.e === 'xxx\nxxx'   &&
                           objects.f === 'xxx\rxxx') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.6.2 should do ToFloat()', function (done) {
            this.timeout(30000);
            rega.exec(`
string s = "1.01";
real r1 = s.ToFloat(); ! r1 = 1.01;
real r2 = "0.1".ToFloat(); ! r2 = 0.1;
real r3 = "1E-1".ToFloat(); ! r3 = 0.1       
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (
                    objects.r1 === '1.010000' &&
                    objects.r2 === '0.100000' &&
                    objects.r3 === '0.100000'
                ) {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });


        it('6.6.3 should do Length()', function (done) {
            this.timeout(30000);
            rega.exec(`
string s = "Hallo\\tWelt!";
integer length = s.Length(); ! length = 11
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.length === '11') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });


        it('6.6.4 should do Substr()', function (done) {
            this.timeout(30000);
            rega.exec(`
string s = "Hallo Welt!";
string world = s.Substr(6, 4); ! world = "Welt"
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.world === 'Welt') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.6.5 should Find() string positions', function (done) {
            this.timeout(30000);
            rega.exec(`
string s = "Hallo Welt";
integer World = s.Find("Welt"); ! World = 6
integer world = s.Find("welt"); ! world = -1
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.World === '6' && objects.world === '-1') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        if(flavor !== '.legacy') {
            it('6.6.5.1 should test Contains(), StartsWith(), EndsWith()', function (done) {
                this.timeout(30000);
                rega.exec(`
string s = "Hallo Welt";
boolean bWorld = s.Contains("Welt"); ! bWorld = true
boolean bStart = s.StartsWith("Hallo"); !bStart = true
boolean bEnd = s.EndsWith("Welt"); !bEnd = true
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.bWorld === 'true' &&
                           objects.bStart === 'true' &&
                           objects.bEnd === 'true') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
                });
            });
        }

        it('6.6.6 should do Split() and sum up ToInteger()', function (done) {
            this.timeout(30000);
            rega.exec(`
string summanden = "1,2,3";
integer summe = 0;
string summand;
foreach(summand, summanden.Split(","))
{
    summe = summe + summand.ToInteger();
}
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.summe === '6') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });

        it('6.6.7 should do StrValueByIndex(()', function (done) {
            this.timeout(30000);
            rega.exec(`
string Rezept = "Butter,Eier,Mehl,Milch,Zucker";
string ErsteZutat = Rezept.StrValueByIndex(",", 0); ! ErsteZutat = Butter
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.ErsteZutat === 'Butter') {
                    done();
                } else {
                    done(new Error(JSON.stringify(objects)));
                }
            });
        });


        if (flavor !== '.legacy') {

            it('6.6.8 should use UriEncode()/UriDecode() (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec(`
string str = " !\\\"#$%&'()";
string kodiert = str.UriEncode(); ! kodiert = %20%21%22%23%24%25%26%27%28%29
string dekodiert = kodiert.UriDecode(); ! dekodiert = !"#$%&\\'()
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.kodiert === '%20%21%22%23%24%25%26%27%28%29' &&
                               objects.dekodiert === ' !"#$%&\'()') {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });

            it('6.6.9 should use ToUTF8()/ToLatin() (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec(`
string str = "Übergrößenträger";
string utf8 = str.ToUTF8(); ! utf8 = "ÃbergrÃ¶ÃentrÃ¤ger“
string latin = utf8.ToLatin(); ! latin= "Übergrößenträger“
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.utf8 === 'ÃbergrÃ¶ÃentrÃ¤ger' &&
                               objects.latin === 'Übergrößenträger') {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });

            it('6.6.10 should use ToUpper()/ToLower() (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec(`
string str = "AbCdEfGhI";
string upper = str.ToUpper(); ! upper = "ABCDEFGHI“
string lower = str.ToLower(); ! lower = "abcdefghi“
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.upper === 'ABCDEFGHI' &&
                               objects.lower === 'abcdefghi') {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });

            it('6.6.11 should use Trim()/LTrim()/RTrim() (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec(`
string str = " \\tAnfang und Ende \\r\\n";
string trim = str.Trim();               ! trim = "Anfang und Ende"
string ltrim = str.LTrim();             ! ltrim = "Anfang und Ende \\r\\n"
string rtrim = str.RTrim();             ! rtrim = " \\tAnfang und Ende"
string trimc = str.Trim(" \\t\\nAnfang"); ! trimc = "und Ende \\r"
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.trim === 'Anfang und Ende' &&
                               objects.ltrim === 'Anfang und Ende \r\n' &&
                               objects.rtrim === ' \tAnfang und Ende' &&
                               objects.trimc === 'und Ende \r') {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });

            it('6.6.12 should use Replace() (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec(`
string str = "John hates Jane";
string replaced = str.Replace("hates", "loves"); ! replaced = "John loves Jane"
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.replaced === 'John loves Jane') {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });

            it('8.1 should use additional math functions (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec(`
var a;
a = -1.5;
var b = a.Abs();      ! b = 1.5
a = 5.0;
var c = a.Mod(3);     ! c = 2.0
var d = a.Min(8.0);   ! d = 5.0
var e = a.Max(8.0);   ! e = 8.0
a = 2.0;
var f = a.Exp();      ! f = 7.389056
var g = a.Exp2();     ! g = 4.0
var h = a.Exp10();    ! h = 100.0
var i = a.Expm1();    ! i = 6.389056
var j = a.Log();      ! j = 0.693147
var k = a.Log2();     ! k = 1.0
var l = a.Log10();    ! l = 0.301030
var m = a.Log1p();    ! m = 1.098612
var n = a.Sqrt();     ! n = 1.414214
var o = a.Cbrt();     ! o = 1.259921
var p = a.Pow(2.0);   ! p = 4.0
var q = a.Sin();      ! q = 0.909297
var r = a.Cos();      ! r = -0.416147
var s = a.Tan();      ! s = -2.185040
a = 1.0;
var t = a.Asin();     ! t = 1.570796
a = 0.0;
var u = a.Acos();     ! u = 1.570796
a = 2.0;
var v = a.Atan();     ! v = 1.107149
var w = a.Sinh();     ! w = 3.626860
var x = a.Cosh();     ! x = 3.762196
var y = a.Tanh();     ! y = 0.964028
var z = a.Asinh();    ! z = 1.443635
var za = a.Acosh();   ! za = 1.316958
a = 0.5;
var zb = a.Atanh();   ! zb = 0.549306
a = 0.4521;
var zc = a.Ceil();    ! zc = 1.0
var zd = a.Floor();   ! zd = 0.0
var ze = a.Trunc(1);  ! ze = 0.4
var zf = a.Round(1);  ! zf = 0.5
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.b === '1.500000' &&
                               objects.c === '2.000000' &&
                               objects.d === '5.000000' &&
                               objects.e === '8.000000' &&
                               objects.f === '7.389056' &&
                               objects.g === '4.000000' &&
                               objects.h === '100.000000' &&
                               objects.i === '6.389056' &&
                               objects.j === '0.693147' &&
                               objects.k === '1.000000' &&
                               objects.l === '0.301030' &&
                               objects.m === '1.098612' &&
                               objects.n === '1.414214' &&
                               objects.o === '1.259921' &&
                               objects.p === '4.000000' &&
                               objects.q === '0.909297' &&
                               objects.r === '-0.416147' &&
                               objects.s === '-2.185040' &&
                               objects.t === '1.570796' &&
                               objects.u === '1.570796' &&
                               objects.v === '1.107149' &&
                               objects.w === '3.626860' &&
                               objects.x === '3.762196' &&
                               objects.y === '0.964028' &&
                               objects.z === '1.443635' &&
                               objects.za === '1.316958' &&
                               objects.zb === '0.549306' &&
                               objects.zc === '1.000000' &&
                               objects.zd === '0.000000' &&
                               objects.ze === '0.400000' &&
                               objects.zf === '0.500000') {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });

            it('8.2 should have math constants like M_E, M_PI, etc. (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec(`
var one = 1.0;
var two = 2.0;
var ten = 10.0;
var m_e = one.Exp() == M_E;
var m_log2e = M_E.Log2() == M_LOG2E;
var m_log10e = M_E.Log10() == M_LOG10E;
var m_ln2 = two.Log() == M_LN2;
var m_ln10 = ten.Log() == M_LN10;
var m_pi = 3.141592653589793 == M_PI;
var m_pi_2 = (M_PI / 2.0) == M_PI_2;
var m_pi_4 = (M_PI / 4.0) == M_PI_4;
var m_1_pi = (1.0 / M_PI) == M_1_PI;
var m_2_pi = (2.0 / M_PI) == M_2_PI;
var m_2_sqrtpi = (2.0 / M_PI.Sqrt()) == M_2_SQRTPI;
var m_sqrt2 = (two.Sqrt() == M_SQRT2);
var m_sqrt1_2 = (1.0 / two.Sqrt()) == M_SQRT1_2;
var r = 4.2; ! Kreisradius in cm
var A = (M_PI * r.Pow(2)).Round(2); ! Kreisfläche A =  pi * r^2 = 55.42 cm
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.one === '1.000000' &&
                               objects.two === '2.000000' &&
                               objects.ten === '10.000000' &&
                               objects.m_e === 'true' &&
                               objects.m_log2e === 'true' &&
                               objects.m_log10e === 'true' &&
                               objects.m_ln2 === 'true' &&
                               objects.m_ln10 === 'true' &&
                               objects.m_pi === 'true' &&
                               objects.m_pi_2 === 'true' &&
                               objects.m_pi_4 === 'true' &&
                               objects.m_1_pi === 'true' &&
                               objects.m_2_pi === 'true' &&
                               objects.m_2_sqrtpi === 'true' &&
                               objects.m_sqrt2 === 'true' &&
                               objects.m_sqrt1_2 === 'true' &&
                               objects.A === '55.420000') {
                        done();
                    } else {
                        done(new Error(output));
                    }
                });
            });


            it('8.2 should return M_PI with 6 digits (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec('Write(M_PI);', (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (output === '3.141593') {
                        done();
                    } else {
                        done(new Error(output));
                    }
                });
            });

            it('8.2 should return M_PI with 15 digits (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec('var pi = M_PI;\nWrite(pi.ToString(15));', (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (output === '3.141592653589793') {
                        done();
                    } else {
                        done(new Error(output));
                    }
                });
            });

            it('9.1 should have working random generator (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec(`
var dice = system.Random(1, 6);
system.Srandom(12345);
var nonrandom = system.Random(-1000, 1000); ! nonrandom = 545
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (parseFloat(objects.dice) >= 1 && parseFloat(objects.dice) <= 6 &&
                               objects.nonrandom === '545') {
                        done();
                    } else {
                        done(new Error(output));
                    }
                });
            });
        }
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
