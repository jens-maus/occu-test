/* global describe, it */
/* eslint-disable no-unused-vars, import/no-unassigned-import, prefer-arrow-callback */

const binrpc = require('binrpc');

const rpcClient = binrpc.createClient({host: '127.0.0.1', port: '1999', reconnectTimeout: 0});

require('should');

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
    flavors,
    indent
} = require('../lib/helper.js');

require('should');

flavors.forEach(flavor => {
    describe('Running ' + __filename.split('/').reverse()[0] + ' test...', () => {
        describe('starting ReGaHss' + flavor, () => {
            it('should start', () => {
                startRega(flavor);
            });
            it('wait for ReGa normal operation', function (done) {
                this.timeout(60000);
                subscribe('rega', /ReGa entering normal operation/, () => {
                    if (flavor === '.legacy') {
                        setTimeout(done, 10000);
                    } else {
                        done();
                    }
                });
            });
        });

        describe('test rega rpc server error handling', () => {
            it('should respond to unknown Method', function (done) {
                rpcClient.methodCall('doesNotExist', [], (err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        res.should.deepEqual({faultCode: -1, faultString: 'doesNotExist: unknown method name'});
                        done();
                    }
                });
            });

            it('should log invalid params', function (done) {
                subscribe('rega', /Error: XmlRpcMethodEvent::execute: invalid parameter size/, () => {
                    done();
                });
                rpcClient.methodCall('event', ['BidCoS-RF:1']);
            });

            it('should log incomplete binrpc message', function (done) {
                this.timeout(15000);
                const buf = Buffer.from([0x42, 0x69, 0x6E, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x05, 0x65, 0x76, 0x65, 0x6E, 0x74, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x0B]);
                subscribe('rega', /Error: XmlRpc: XmlRpcServerConnection::readRequest: EOF while reading request/, () => {
                    done();
                });
                rpcClient.socket.write(buf);
                rpcClient.socket.destroy();
            });
        });

        describe('stop ReGaHss' + flavor + ' process', () => {
            it('should disconnect the rpc client', function (done) {
                rpcClient.reconnectTimeout = 0;
                rpcClient.socket.unref();
                rpcClient.socket.destroy();
                done();
            });

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
});
