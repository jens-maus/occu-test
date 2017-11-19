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

let simPipeOut;
let simPipeErr;
let simSubscriptions = {};
let simBuffer = [];

let procs = {};

let regaSubscriptions = {};
let regaBuffer = [];

let subIndex = 0;

let flavors = [];
if(process.env.FLAVOR) {
  flavors = [ '.' + process.env.FLAVOR ];
} else {
  flavors = [ '.legacy', '.normal', '.community' ];
}

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
    simSubscriptions = {};
    simBuffer = [];
    procs.sim = cp.spawn(simCmd, simArgs);
    simPipeOut = procs.sim.stdout.pipe(streamSplitter('\n'));
    simPipeErr = procs.sim.stderr.pipe(streamSplitter('\n'));
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

function startRega(flavor, faketime) {
    regaSubscriptions = {};
    regaBuffer = [];
    if (!flavor) {
        flavor = '.' + process.env.FLAVOR;
    }
    if (faketime) {
        procs.rega = cp.spawn('unbuffer', ['/usr/bin/faketime', '-f', '@' + faketime, '/bin/ReGaHss' + flavor, '-c', '-l', '0', '-f', '/etc/rega.conf']);
    } else {
        procs.rega = cp.spawn('unbuffer', ['/bin/ReGaHss' + flavor, '-c', '-l', '0', '-f', '/etc/rega.conf']);
    }
    //console.log('spawned /bin/ReGaHss' + flavor + ' (pid ' + procs.rega.pid + ')');
    let regaPipeOut = procs.rega.stdout.pipe(streamSplitter('\n'));
    let regaPipeErr = procs.rega.stderr.pipe(streamSplitter('\n'));
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

module.exports = {
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
};
