/* global describe  */
/* eslint-disable no-unused-vars, import/no-unassigned-import, prefer-arrow-callback */

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

flavors.forEach(function (flavor) {
    describe('Running ' + __filename.split('/').reverse()[0] + ' test...', function () {
        describe('test examples from HM_Script_Teil_3_Beispiele_V1.1', function () {

        });
    });
});
