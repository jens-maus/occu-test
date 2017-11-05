const cp = require('child_process');
const streamSplitter = require('stream-splitter');
const Rega = require('homematic-rega');
const path = require('path');

const regaOutput = false; // Set to true to show stdout/stderr of ReGaHss process
const simOutput = false; // Set to true to show stdout/stderr of hm-simulator

require('should');


cp.spawnSync('sudo ./install_rega.sh', {shell: true, stdio: 'inherit'});


const simCmd = path.join(__dirname, '../node_modules/.bin/hm-simulator');
const simArgs = [];
let sim;
let simPipeOut;
let simPipeErr;
const simSubscriptions = {};
const simBuffer = [];



let regaSubscriptions = {};
let regaBuffer = [];

let subIndex = 0;

function subscribe(type, rx, cb) {
    subIndex += 1;
    if (type === 'sim') {
        simSubscriptions[subIndex] = {rx, cb};
    } else if (type === 'rega') {
        regaSubscriptions[subIndex] = {rx, cb};
    }
    matchSubscriptions(type);
    return subIndex;
}


function matchSubscriptions(type, data) {
    let subs;
    let buf;
    if (type === 'sim') {
        subs = simSubscriptions;
        buf = simBuffer;
    } else if (type === 'rega') {
        subs = regaSubscriptions;
        buf = regaBuffer;
    }
    if (data) {
        buf.push(data);
    }
    buf.forEach((line, index) => {
        Object.keys(subs).forEach(key => {
            const sub = subs[key];
            if (line.match(sub.rx)) {
                sub.cb(line);
                delete subs[key];
                buf.splice(index, 1);
            }
        });
    });
}

function startSim() {
    sim = cp.spawn(simCmd, simArgs);
    simPipeOut = sim.stdout.pipe(streamSplitter('\n'));
    simPipeErr = sim.stderr.pipe(streamSplitter('\n'));
    simPipeOut.on('token', data => {
        if (simOutput) {
            console.log('sim', data.toString());
        }
        matchSubscriptions('sim', data.toString());
    });
    simPipeErr.on('token', data => {
        if (simOutput) {
            console.log('sim', data.toString());
        }
        matchSubscriptions('sim', data.toString());
    });
}

let regaProc;

function startRega(flavor) {
    regaSubscriptions = {};
    regaBuffer = [];
    regaProc = cp.spawn('/bin/ReGaHss' + flavor, ['-c', '-l', '0', '-f', '/etc/rega.conf']);
    //console.log('spawned /bin/ReGaHss' + flavor + ' (pid ' + regaProc.pid + ')');
    let regaPipeOut = regaProc.stdout.pipe(streamSplitter('\n'));
    let regaPipeErr = regaProc.stderr.pipe(streamSplitter('\n'));
    regaPipeOut.on('token', data => {
        if (regaOutput) {
            console.log('ReGaHss', data.toString());
        }
        matchSubscriptions('rega', data.toString());
    });
    regaPipeErr.on('token', data => {
        if (regaOutput) {
            console.log('ReGaHss', data.toString());
        }
        matchSubscriptions('rega', data.toString());
    });
}

describe('rfd/hmipserver Simulator', () => {
    it('should start', function () {
        startSim();
    });
});

const rega = new Rega({host: 'localhost', port: '8183'});

['', '.normal', '.community'].forEach(flavor => {

    describe('ReGaHss' + flavor, () => {

        it('should start', () => {
            startRega(flavor);
        });

        it('should start TimerSchedulerThread', function (done) {
	        this.timeout(30000);
            subscribe('rega', /TimerSchedulerThread started/, () => {
                done();
            })
        });

        it('should init XmlRpcMethodListDevices', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodListDevices/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodNewDevices', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodNewDevices/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodDeleteDevices', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodDeleteDevices/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodReportValueUsage', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodReportValueUsage/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodUpdateDevice', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodUpdateDevice/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodReplaceDevice', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodReplaceDevice/, () => {
                done();
            });
        });

        it('should init XmlRpcMethodSetReadyConfig', function (done) {
			this.timeout(30000);
            subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodSetReadyConfig/, () => {
                done();
            });
        });

        it('should load /etc/config/homematic.regadom', function (done) {
            this.timeout(30000);
            subscribe('rega', /successfully loaded "\/etc\/config\/homematic\.regadom"/, () => {
                done();
            });
        });



        it('should start HTTP server', function (done) {
            this.timeout(30000);
            subscribe('rega', /HTTP server started successfully/, () => {
                done();
            });
        });

        if (flavor !== '') {
            it('should execute /bin/hm_startup', function (done) {
                this.timeout(30000);
                subscribe('rega', /Executing \/bin\/hm_startup/, () => {
                    done();
                });
            });
        }

        it('should do init on simulated rfd', function (done) {
            this.timeout(30000);
            subscribe('sim', /rpc rfd < init \["xmlrpc_bin:\/\/127\.0\.0\.1:1999","1100"]/, () => {
                done();
            });
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
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.x === '0' && objects.y === '0.100000') {
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

        if (flavor === '') {
            it('5.2 should terminate while(true) after 5000 iterations (legacy)', function (done) {
                this.timeout(30000);
                rega.exec(`
integer i = 0;
while (true) { i = i + 1; }
! i = 5001
            `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.i === '5001') {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });

        } else {
            // FIXME documentation does not mention that standard/community terminates after 500000 iterations!
            it('5.2 should terminate while(true) after 500000 iterations (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec(`
integer i = 0;
while (true) { i = i + 1; }
            `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.i === '500001') {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
                    }
                });
            });

        }


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

        if (flavor === '') {
            it('6.1.1 should determine VarType() (legacy)', function (done) {
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
            it('6.1.1 should determine VarType() (standard/community)', function (done) {
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

            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.s === '1.235') {
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
            // FIXME Example seems to be wrong in Documentation! (01:00:01 vs 00:00:01)
            rega.exec(`
var i = 1;
var t = i.ToTime(); ! t = @1970-01-01 01:00:01@  

            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.t === '1970-01-01 00:00:01') {
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
string sDate = t.Format("%d.%m.%Y"); ! sDate = "24.12.2008";
string sTime = t.Format("%H:%M:%S"); ! sTime = "18:30:00";
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.sDate === '24.12.2008' && objects.sTime === '18:30:00') {
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


        if (flavor !== '') {

            it('8.1 should calculate Abs() (standard/community)', function (done) {
                this.timeout(30000);
                rega.exec('var y = -3;\nvar x = y.Abs();', (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.y === '-3' && objects.x === '3.000000') {
                        done();
                    } else {
                        done(new Error(JSON.stringify(objects)));
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
        }

    });

    describe('test examples from HM_Script_Teil_2_Objektmodell_V1.2', () => {

    });

    describe('test examples from HM_Script_Teil_3_Beispiele_V1.1', () => {

    });



    describe('stop ReGaHss' + flavor + ' process', () => {
        it('should stop', function (done) {
            this.timeout(30000);
            regaProc.on('close', () => {
                regaProc = null;
                done();
            });
            cp.spawnSync('kill', ['-9', regaProc.pid]);
        });
    });

});

describe('stop simulator', () => {
    it('should stop', function () {
        sim.kill();
    });
});
