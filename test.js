const cp = require('child_process');
const streamSplitter = require('stream-splitter');
const Rega = require('homematic-rega');

const regaOutput = false; // Set to true to show stdout/stderr of ReGaHss process

require('should');

cp.spawnSync('sudo ./install_rega.sh', {shell: true, stdio: 'inherit'});

let regaSubscriptions = {};
let regaBuffer = [];
const simSubscriptions = {};
const simBuffer = [];

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

    });


    describe('basic remote script tests', () => {
        it('should output Hello World', function (done) {
            this.timeout(30000);
            rega.exec('string x = "Hello";\nWriteLine(x # " World!");', (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (output === 'Hello World!\r\n') {
                    done();
                } else {
                    done(new Error('wrong output'));
                }
            });
        });


        if (flavor === '') {
            it('should terminate while(true) after 5000 iterations', function (done) {
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
                        done(new Error('wrong result'));
                    }
                });
            });
        } else {
            it('should terminate while(true) after 50000 iterations', function (done) {
                this.timeout(30000);
                rega.exec(`
integer i = 0;
while (true) { i = i + 1; }
            `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.i === '50001') {
                        done();
                    } else {
                        done(new Error('wrong result'));
                    }
                });
            });
        }


        it('should do VarType()', function (done) {
            this.timeout(30000);
            rega.exec(`
boolean b;
integer bType = b.VarType(); ! type = 1;

integer i;
integer iType = i.VarType(); ! type = 2;

real r;
integer rType = r.VarType(); ! type = 3;

string s;
integer sType = s.VarType(); ! type = 4;

            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (
                    objects.bType === '1' &&
                    objects.iType === '2' &&
                    objects.rType === '3' &&
                    objects.sType === '4'
                ) {
                    done();
                } else {
                    done(new Error('wrong result'));
                }
            });
        });

        if (flavor !== '') {
            it('should calculate Abs()', function (done) {
                this.timeout(30000);
                rega.exec('var y = -3;\nvar x = y.Abs();', (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (objects.y === '-3' && objects.x === '3.000000') {
                        done();
                    } else {
                        done(new Error('wrong output'));
                    }
                });
            });

            it('should return M_PI with 6 digits', function (done) {
                this.timeout(30000);
                rega.exec('Write(M_PI);', (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (output === '3.141593') {
                        done();
                    } else {
                        done(new Error('wrong output'));
                    }
                });
            });

            it('should return M_PI with 15 digits', function (done) {
                this.timeout(30000);
                rega.exec('var pi = M_PI;\nWrite(pi.ToString(15));', (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else if (output === '3.141592653589793') {
                        done();
                    } else {
                        done(new Error('wrong output'));
                    }
                });
            });
        }

        it('should do Split() and sum up ToInteger()', function (done) {
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
                    done(new Error('wrong output'));
                }
            });
        });

        it('should Find() string positions', function (done) {
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
                    done(new Error('wrong output'));
                }
            });
        });

        it('should do Substr()', function (done) {
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
                    done(new Error('wrong output'));
                }
            });
        });

        it('should do Length()', function (done) {
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
                    done(new Error('wrong output'));
                }
            });
        });

        it('should do date/time Format()', function (done) {
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
                    done(new Error('wrong output'));
                }
            });
        });

        it('should handle scientific real representation -1.0E-1 = -0.1', function (done) {
            this.timeout(30000);
            rega.exec(`
real r = -1.0E-1; ! -0.1
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else if (objects.r === '-0.1') {
                    done();
                } else {
                    done(new Error('wrong result: ' + objects.r));
                }
            });
        });





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

