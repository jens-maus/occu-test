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
        it('should start HTTP server', function (done) {
            this.timeout(60000);
            subscribe('rega', /HTTP server started successfully/, () => {
                done();
            });
        });
        if (flavor === '.legacy') {
            // Prevent problem that rega didn't stop after the tests...?!
            it('should wait 10 seconds', function (done) {
                this.timeout(11000);
                setTimeout(done, 10000);
            });
        }

    });

    describe('ReGaHss' + flavor + ': verifying bug fixes', () => {
        if(flavor !== '.legacy') {
            it('correct date/time output at DST boюndaries', function (done) {
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
                this.timeout(30000);
                var prg = "";
                var res = "";
                for(i=1; i <= 1000; i++) {
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
        }

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
});
