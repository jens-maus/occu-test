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

    describe('test scripts from https://github.com/hobbyquaker/homematic-rega/tree/master/scripts', () => {

        it('should run variables.rega', function (done) {
            this.timeout(30000);
            rega.exec(`
!# variables.rega
!#
!# Dieses Script gibt die Systemvariablen im JSON Format aus
!#
!# 3'2013-9'2017 hobbyquaker https://github.com/hobbyquaker
!#

object oSysVar;
string sSysVarId;
string sValueType;
string sValue;
boolean bFirst = true;

Write('[');
WriteLine('{"id": "40", "name": "Alarmmeldungen", "val":' # dom.GetObject(40).Value() # ', "min": 0, "max": 65000, "unit": "", "type": "number", "enum": ""},');
Write('{"id": "41", "name": "Servicemeldungen", "val":' # dom.GetObject(41).Value() # ', "min": 0, "max": 65000, "unit": "", "type": "number", "enum": ""}');

foreach (sSysVarId, dom.GetObject(ID_SYSTEM_VARIABLES).EnumUsedIDs()) {
    WriteLine(',');
    oSysVar = dom.GetObject(sSysVarId);
    sValueType = oSysVar.ValueType();
    Write('{"id": "' # sSysVarId # '", "name": "' # oSysVar.Name() # '", "val": ');

    if (sValueType == 20) {
        Write('"' # oSysVar.Value() # '"');
    } else {
        sValue = oSysVar.Value();
        if (sValueType == 2) {
            if (sValue) {
                Write("true");
            } else {
                Write("false");
            }
        } else {
            if (sValue == "") {
                Write("0");
            } else {
                Write(sValue);
            }
        }
    }

    string sValueMin = oSysVar.ValueMin();
    if (sValueMin == '') {
        sValueMin = 'null';
    }

    string sValueMax = oSysVar.ValueMax();
    if (sValueMax == '') {
        sValueMax = 'null';
    }

    Write(',"ts":"' # oSysVar.Timestamp());
    Write('","min":' # sValueMin # ',"max":' # sValueMax # ',"unit":"' # oSysVar.ValueUnit() # '"');

    if (sValueType == 2) {
        Write(', "type": "boolean", "enum": "' # oSysVar.ValueName0() # ';' # oSysVar.ValueName1());
    } else {
        if (sValueType == 20) {
            Write(', "type": "string", "enum": "' # oSysVar.ValueList());
        } else {
            Write(', "type": "number", "enum": "' # oSysVar.ValueList());
        }
    }

    Write('"}');
}

Write(']');
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else {
                    const data = JSON.parse(output);
                    data.should.deepEqual({

                    });
                    done();
                }
            });
        });

        it('should run programs.rega', function (done) {
            this.timeout(30000);
            rega.exec(`
!# programs.rega
!# Dieses Script gibt eine Liste der Programme im JSON Format aus
!#
!# 3'2013-9'2017 hobbyquaker https://github.com/hobbyquaker
!#

string oPrgID;
object oProgram;
boolean first = true;

Write('[');

foreach (oPrgID, dom.GetObject(ID_PROGRAMS).EnumUsedIDs()) {
    oProgram = dom.GetObject(oPrgID);

    if(oProgram != null) {
        if (first == false) {
            WriteLine(',');
        } else {
            first = false;
        }

        Write('{"id": "' # oPrgID # '", "name":"' # oProgram.Name() # '", "active":' # oProgram.Active());
        Write(',"ts":"' # oProgram.ProgramLastExecuteTime());
        Write('"}');
    }
}

Write(']');
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else {
                    const data = JSON.parse(output);
                    data.should.deepEqual({});
                    done();
                }
            });
        });

        it('should run channels.rega', function (done) {
            this.timeout(30000);
            rega.exec(`
!# devices.rega
!#
!# Dieses Homematic-Script gibt eine Liste aller Geraete/Kanaele im JSON Format aus
!#
!# 3'2013-9'2017 hobbyquaker https://github.com/hobbyquaker
!#

string sDevId;
string sChnId;

Write('[');

boolean dFirst = true;

foreach (sDevId, root.Devices().EnumUsedIDs()) {

    object oDevice   = dom.GetObject(sDevId);
    boolean bDevReady = oDevice.ReadyConfig();

    if (bDevReady) {

        if (dFirst) {
            dFirst = false;
        } else {
            WriteLine(',');
        }

        Write('{"id": "' # sDevId # '", "address": "' # oDevice.Address() # '", "name": "' # oDevice.Name() # '"}');

        foreach(sChnId, oDevice.Channels()) {
            object oChannel = dom.GetObject(sChnId);
            WriteLine(',');
            Write('{"id": "' # sChnId # '", "address": "' # oChannel.Address() # '", "name":"' # oChannel.Name() # '"}');
        }

    }
}

Write(']');
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else {
                    const data = JSON.parse(output);
                    data.should.deepEqual({

                    });
                    done();
                }
            });
        });

        it('should run functions.rega', function (done) {
            this.timeout(30000);
            rega.exec(`
!# functions.rega
!#
!# Dieses Script gibt eine Liste der Gewerke im JSON Format aus
!#
!# 9'2017 hobbyquaker
!# 6'2013-9'2013 bluefox, hobbyquaker
!#

object  oFunction;
string  sFunctionId;
string  sChannelId;
boolean bFirst       = true;
boolean bFirstSecond = true;

Write("[");

foreach (sFunctionId, dom.GetObject(ID_FUNCTIONS).EnumUsedIDs()) {

    if (bFirst == false) {
        WriteLine(',');
    } else {
        bFirst = false;
    }

    oFunction = dom.GetObject(sFunctionId);
    Write('{"id": "' # sFunctionId # '", "name": "' # oFunction.Name() # '", "channels": [');
    bFirstSecond = true;

    foreach(sChannelId, oFunction.EnumUsedIDs()) {
        if (bFirstSecond == false) {
            Write(',');
        } else {
            bFirstSecond = false;
        }
        Write(sChannelId);
    }

    Write(']}');
}

Write(']');
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else {
                    const data = JSON.parse(output);
                    data.should.deepEqual({

                    });
                    done();
                }
            });
        });

        it('should run rooms.rega', function (done) {
            this.timeout(30000);
            rega.exec(`
!# rooms.rega
!#
!# Dieses Script gibt eine Liste der Raeume im JSON Format aus
!#
!# 9'2017 hobbyquaker
!# 5'2013-7'2013 bluefox, hobbyquaker
!#

object  oRoom;
string  sRoomId;
string  sChannelId;
boolean bFirst       = true;
boolean bFirstSecond = true;

Write("[");

foreach (sRoomId, dom.GetObject(ID_ROOMS).EnumUsedIDs()) {
    if (bFirst == false) {
        WriteLine(',');
    } else {
        bFirst = false;
    }

    oRoom = dom.GetObject(sRoomId);
    Write('{"id": "' # sRoomId # '", "name": "' # oRoom.Name() # '", ');
    Write('"channels":[');
    bFirstSecond = true;

    foreach(sChannelId, oRoom.EnumUsedIDs()) {
        if (bFirstSecond == false) {
            Write(',');
        } else {
            bFirstSecond = false;
        }
        Write(sChannelId);
    }

    Write(']}');
}

Write(']');
            `, (err, output, objects) => {
                if (err) {
                    done(err);
                } else {
                    const data = JSON.parse(output);
                    data.should.deepEqual({

                    });
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
