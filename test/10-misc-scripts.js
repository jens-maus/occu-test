/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, camelcase */

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
            it('should fake datetime', function (done) {
                this.timeout(5 * 365 * 24 * 60 * 60 * 1000);
                const time = '2017-12-01 12:00:00 CET';
                cp.exec('sudo /bin/date -s "' + time + '" +"%Y-%m-%d %H:%M:%S %z (%Z) : %s"', (e, stdout) => {
                    if (e) {
                        done(e);
                    } else if (!stdout || stdout.replace('\n', '').length === 0) {
                        done(new Error('invalid faketime: "' + time + '"'));
                    } else {
                        done();
                    }
                    console.log('      ' + stdout.replace('\n', ''));
                });
            });
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

            it('should output DST offset', function (done) {
                this.timeout(30000);
                subscribe('rega', /DST offset =/, output => {
                    done();
                    console.log('      ' + output);
                });
            });

            it('should output reference time', function (done) {
                this.timeout(30000);
                subscribe('rega', /GetNextTimer called for reference time/, output => {
                    done();
                    console.log('      ' + output);
                });
            });
        });

        describe('testing examples from https://www.homematic-inside.de/tecbase/homematic/scriptlibrary', () => {
            it('testing "tageszeit-in-abschnitte-unterteilen"', function (done) {
                this.timeout(30000);
                rega.exec(`
! Tageszeiten
! Tagesbeginn - 2 Nacht
! Tagesbeginn - 2 Tagesbeginn - 1 frühmorgens
! Tagesbeginn - 1 Tagesbeginn Morgengrauen
! Tagesbeginn Mittag - 1 Vormittag
! Mittag - 1 Mittag + 1 Mittag
! Mittag + 1 Tagesende Nachmittag
! Tagesende Tagesende + 1 Dämmerung
! Tagesende + 1 Tagesende + 2 Abend
! Tagesende + 2 Nacht

real c_zeit = (0.01 * system.Date("%M").ToInteger()) + system.Date("%H").ToInteger();
real c_tagesbeginn = (0.01 * system.SunriseTime("%M").ToInteger()) + system.SunriseTime("%H").ToInteger();
real c_tagesende = (0.01 * system.SunsetTime("%M").ToInteger()) + system.SunsetTime("%H").ToInteger();
real c_mittag = 13.00; ! Mittagszeit

integer v_tageszeit = 0; ! Nacht

if (c_zeit < c_tagesende + 2) {
    v_tageszeit = 7; ! Abend
}

if (c_zeit < c_tagesende + 1) {
    v_tageszeit = 6; ! Abenddaemmerung
}

if (c_zeit < c_tagesende) {
    v_tageszeit = 5; ! Nachmittag
}

if (c_zeit < c_mittag + 1) {
    v_tageszeit = 4; ! Mittag
}

if (c_zeit < c_mittag - 1) {
    v_tageszeit = 3; ! Vormittag
}

if (c_zeit < c_tagesbeginn) {
    v_tageszeit = 2; ! Morgengrauen
}

if (c_zeit < c_tagesbeginn - 1) {
    v_tageszeit = 1; ! fruemorgens;
}

if (c_zeit < c_tagesbeginn - 2) {
    v_tageszeit = 0; ! Nacht
}

! dom.GetObject("Tageszeit").State(v_tageszeit);
                `, (err, output, objects) => {
                    if (err) {
                        done(err);
                    } else {
                        objects.should.containEql({
                            c_zeit: '12.000000',
                            c_tagesbeginn: '7.580000',
                            c_tagesende: '15.530000',
                            c_mittag: '13.000000',
                            v_tageszeit: '4'
                        });
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
