/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, prefer-arrow-callback, max-nested-callbacks, capitalized-comments */

const {
    cp,
    rega,
    subscribe,
    procs,
    simSubscriptions,
    simBuffer,
    regaSubscriptions,
    regaBuffer,
    flavors,
    indent,
    initTest,
    cleanupTest
} = require('../lib/helper.js');

require('should');

flavors.forEach(function (flavor) {
    describe('Running ' + __filename.split('/').reverse()[0] + ' [' + flavor + ']', function () {
        // initialize test environment
        initTest(flavor);

        describe('running tests', function () {
            // run tests
            it('should start TimerSchedulerThread', function (done) {
                this.timeout(30000);
                subscribe('rega', /TimerSchedulerThread started/, function () {
                    done();
                });
            });

            it('should start IseRTPrgThread', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: IseRTPrgThread thread function started/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodListDevices', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodListDevices/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodNewDevices', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodNewDevices/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodDeleteDevices', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodDeleteDevices/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodReportValueUsage', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodReportValueUsage/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodUpdateDevice', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodUpdateDevice/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodReplaceDevice', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodReplaceDevice/, function () {
                    done();
                });
            });

            it('should init XmlRpcMethodSetReadyConfig', function (done) {
                this.timeout(30000);
                subscribe('rega', /Info: InitXmlRpcMethods: XmlRpcMethodSetReadyConfig/, function () {
                    done();
                });
            });

            it('should load /etc/config/homematic.regadom', function (done) {
                this.timeout(30000);
                subscribe('rega', /successfully loaded "\/etc\/config\/homematic\.regadom"/, function () {
                    done();
                });
            });

            it('should output build label', function (done) {
                this.timeout(30000);
                rega.exec(`
string build = dom.BuildLabel();
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        objects.build.should.not.equal('undefined');
                        done();
                        console.log(indent(objects.build, 8));
                    }
                });
            });

            it('should execute /bin/hm_startup', function (done) {
                this.timeout(30000);
                subscribe('rega', /Executing \/bin\/hm_startup/, function () {
                    done();
                });
            });

            it('should allow objects with ID >65535', function (done) {
                this.timeout(30000);
                rega.exec(`
integer i = 65500;
integer j = 0;
object lastsysvar = null;
while((i >= 0) && (i <= 200000))
{
  object sysvar = dom.CreateObject(OT_VARDP, i, i);
  if(!sysvar) {
    i = -1;
  } else {
    lastsysvar = sysvar;
    i = i + 1;
    j = j + 1;
  }
}
WriteLine(lastsysvar.Name());
WriteLine(j);
                `, function (err, output, objects) {
                    if (err) {
                        done(err);
                    } else {
                        output.should.equal('200000\r\n134501\r\n');
                        done();
                        console.log(indent(output, 8));
                    }
                });
            });
        });

        // cleanup Test environment
        cleanupTest(flavor);
    });
});
