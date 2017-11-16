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

    describe('test https://www.homematic-inside.de/tecbase/homematic/scriptlibrary', () => {
        it('should fake datetime', function (done) {
            this.timeout(5 * 365 * 24 * 60 * 60 * 1000);
            const time = '2017-12-01 12:00:00';
            cp.exec('sudo /bin/date -s "' + time + '"', function (e, stdout) {
                if(!stdout || stdout.replace('\n', '').length === 0) {
                    done(new Error('invalid faketime: "' + time + '"'));
                } else {
                    done();
                }
                console.log('      ' + stdout.replace('\n', ''));
            });
        });

        it('should start ReGaHss' + flavor, function (done) {
            this.timeout(15000);
            startRega(flavor);
            done();
        });

        it('should output DST offset', function (done) {
            this.timeout(30000);
            subscribe('rega', /DST offset =/, output => {
                console.log('      ' + output);
                done();
            });
        });

        it('should output reference time', function (done) {
            this.timeout(30000);
            subscribe('rega', /GetNextTimer called for reference time/, output => {
                console.log('      ' + output);
                done();
            });
        });

        it('should wait 15 seconds', function (done) {
            this.timeout(16000);
            setTimeout(done, 15000);
        });

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
                    objects.c_zeit.should.equal('12.000000');
                    objects.c_tagesbeginn.should.equal('7.580000');
                    objects.c_tagesende.should.equal('15.530000');
                    objects.c_mittag.should.equal('13.000000');
                    objects.v_tageszeit.should.equal('4');
                    done();
                }
            });
        });

        it('should stop ReGaHss' + flavor, function (done) {
            this.timeout(60000);
            procs.rega.on('close', () => {
                procs.rega = null;
                done();
            });
            cp.spawnSync('killall', ['-s', 'SIGINT', 'ReGaHss' + flavor]);
        });

    });

});
