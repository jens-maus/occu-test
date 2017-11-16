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

require('should');

flavors.forEach(flavor => {
    describe('ReGaHss' + flavor, () => {

        it('should start ReGaHss' + flavor, () => {
            startRega(flavor);
        });
        it('should wait 15 seconds', function (done) {
            this.timeout(16000);
            setTimeout(done, 15000);
        });
    });

    describe('test https://www.homematic-inside.de/tecbase/homematic/scriptlibrary', () => {

        it('should run tageszeit-in-abschnitte-unterteilen', function (done) {
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

                    done();
                }
            });
        });



    });

    describe('stop ReGaHss' + flavor + ' process', () => {
        it('should stop', function (done) {
            this.timeout(60000);
            procs.rega.on('close', () => {
                procs.rega = null;
                done();
            });
            cp.spawnSync('killall', ['-s', 'SIGINT', 'ReGaHss' + flavor]);
        });
    });
});



