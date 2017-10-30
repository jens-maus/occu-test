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

