const cp = require('child_process');
const streamSplitter = require('stream-splitter');
const Rega = require('homematic-rega');

require('should');

cp.spawnSync('sudo ./install_rega.sh', {shell: true, stdio: 'inherit'});

const regaSubscriptions = {};
const regaBuffer = [];
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

function startRega() {
    regaProc = cp.spawn('/bin/ReGaHss', ['-c', '-l', '0', '-f', '/etc/rega.conf']);
    let regaPipeOut = regaProc.stdout.pipe(streamSplitter('\n'));
    let regaPipeErr = regaProc.stderr.pipe(streamSplitter('\n'));
    regaPipeOut.on('token', data => {
        //console.log('rega', data.toString());
        matchSubscriptions('rega', data.toString());
    });
    regaPipeErr.on('token', data => {
        //console.log('rega', data.toString());
        matchSubscriptions('rega', data.toString());
    });
}

startRega();


const rega = new Rega({host: 'localhost', port: '8183'});

describe('rega process', () => {
    it('should start TimerSchedulerThread', function (done) {
        subscribe('rega', /TimerSchedulerThread started/, () => {
            done();
        })
    });

    it('should init XmlRpcMethodListDevices', function (done) {
        subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodListDevices/, () => {
            done();
        });
    });

    it('should init XmlRpcMethodNewDevices', function (done) {
        subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodNewDevices/, () => {
            done();
        });
    });

    it('should init XmlRpcMethodDeleteDevices', function (done) {
        subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodDeleteDevices/, () => {
            done();
        });
    });

    it('should init XmlRpcMethodReportValueUsage', function (done) {
        subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodReportValueUsage/, () => {
            done();
        });
    });

    it('should init XmlRpcMethodUpdateDevice', function (done) {
        subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodUpdateDevice/, () => {
            done();
        });
    });

    it('should init XmlRpcMethodReplaceDevice', function (done) {
        subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodReplaceDevice/, () => {
            done();
        });
    });

    it('should init XmlRpcMethodSetReadyConfig', function (done) {
        subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodSetReadyConfig/, () => {
            done();
        });
    });

});


describe('basic remote script tests', () => {
    it('should output Hello World', function (done) {
        rega.exec('string x = "Hello";\nWriteLine(x # " World!");', (err, output, objects) => {
            if (err) {
                throw err;
            }
            if (output === 'Hello World!\r\n') {
                done();
            } else {
                done(new Error('wrong output'));
            }
        });
    });
});
