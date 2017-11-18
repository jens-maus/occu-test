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
