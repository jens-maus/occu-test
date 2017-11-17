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
            this.timeout(30000);
            subscribe('rega', /HTTP server started successfully/, () => {
                done();
            });
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
                    data.should.deepEqual([
                        {
                            id: '40',
                            name: 'Alarmmeldungen',
                            val: 0,
                            min: 0,
                            max: 65000,
                            unit: '',
                            type: 'number',
                            enum: ''
                        },
                        {
                            id: '41',
                            name: 'Servicemeldungen',
                            val: 0,
                            min: 0,
                            max: 65000,
                            unit: '',
                            type: 'number',
                            enum: ''
                        },
                        {
                            id: '1234',
                            name: '${sysVarAlarmZone1}',
                            val: false,
                            ts: '1970-01-01 01:00:00',
                            min: null,
                            max: null,
                            unit: '',
                            type: 'boolean',
                            enum: '${sysVarAlarmZone1NotTriggered};${sysVarAlarmZone1Triggered}'
                        },
                        {
                            id: '950',
                            name: '${sysVarPresence}',
                            val: true,
                            ts: '2020-10-25 03:30:25',
                            min: null,
                            max: null,
                            unit: '',
                            type: 'boolean',
                            enum: '${sysVarPresenceNotPresent};${sysVarPresencePresent}'
                        },
                        {
                            id: '1240',
                            name: 'VarAlarm1',
                            val: false,
                            ts: '1970-01-01 01:00:00',
                            min: null,
                            max: null,
                            unit: '',
                            type: 'boolean',
                            enum: 'nicht ausgelöst;ausgelöst'
                        },
                        {
                            id: '1237',
                            name: 'VarBool1',
                            val: false,
                            ts: '2020-10-25 03:30:25',
                            min: null,
                            max: null,
                            unit: '',
                            type: 'boolean',
                            enum: 'ist falsch;ist wahr'
                        },
                        {
                            id: '1238',
                            name: 'VarEnum1',
                            val: 0,
                            ts: '2020-10-25 03:30:25',
                            min: null,
                            max: null,
                            unit: '',
                            type: 'number',
                            enum: 'Wert 1;Wert 2;Wert 3'
                        },
                        {
                            id: '1239',
                            name: 'VarNum1',
                            val: 0,
                            ts: '2020-10-25 03:30:25',
                            min: 0,
                            max: 65000,
                            unit: '',
                            type: 'number',
                            enum: ''
                        },
                        {
                            id: '1243',
                            name: 'VarString1',
                            val: '???',
                            ts: '2020-10-25 03:30:25',
                            min: null,
                            max: null,
                            unit: '',
                            type: 'string',
                            enum: ''
                        }
                    ]);
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
                    for (let i = 0; i < data.length; i++) {
                        delete data[i].ts;
                    }
                    data.should.deepEqual([
                        {
                            id: '1269',
                            name: 'Bool1OnFalse',
                            active: true
                        },
                        {
                            id: '1244',
                            name: 'Bool1OnFalseUpdate',
                            active: true
                        },
                        {
                            id: '1280',
                            name: 'Bool1OnTrue',
                            active: true
                        },
                        {
                            id: '1291',
                            name: 'Bool1OnTrueUpdate',
                            active: true
                        },
                        { id: '1337', name: 'Key1', active: true },
                        {
                            id: '1326',
                            name: 'Key16Key17',
                            active: true
                        },
                        {
                            id: '1314',
                            name: 'Time0100',
                            active: true
                        },
                        {
                            id: '1430',
                            name: 'Time0130',
                            active: true
                        },
                        {
                            id: '1458',
                            name: 'Time0155',
                            active: true
                        },
                        {
                            id: '1470',
                            name: 'Time0200',
                            active: true
                        },
                        {
                            id: '1498',
                            name: 'Time0205',
                            active: true
                        },
                        {
                            id: '1510',
                            name: 'Time0230',
                            active: true
                        },
                        {
                            id: '1522',
                            name: 'Time0255',
                            active: true
                        },
                        {
                            id: '1534',
                            name: 'Time0300',
                            active: true
                        },
                        {
                            id: '1546',
                            name: 'Time0305',
                            active: true
                        },
                        {
                            id: '1558',
                            name: 'Time0330',
                            active: true
                        },
                        {
                            id: '1302',
                            name: 'TimeEveryMinute',
                            active: true
                        }
                    ]);
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
                    data.should.deepEqual( [
                        { id: '1010', address: 'BidCoS-RF', name: 'HM-RCV-50 BidCoS-RF' },
                        {
                            id: '1011',
                            address: 'BidCoS-RF:0',
                            name: 'HM-RCV-50 BidCoS-RF:0'
                        },
                        {
                            id: '1013',
                            address: 'BidCoS-RF:1',
                            name: 'HM-RCV-50 BidCoS-RF:1'
                        },
                        {
                            id: '1017',
                            address: 'BidCoS-RF:2',
                            name: 'HM-RCV-50 BidCoS-RF:2'
                        },
                        {
                            id: '1021',
                            address: 'BidCoS-RF:3',
                            name: 'HM-RCV-50 BidCoS-RF:3'
                        },
                        {
                            id: '1025',
                            address: 'BidCoS-RF:4',
                            name: 'HM-RCV-50 BidCoS-RF:4'
                        },
                        {
                            id: '1029',
                            address: 'BidCoS-RF:5',
                            name: 'HM-RCV-50 BidCoS-RF:5'
                        },
                        {
                            id: '1033',
                            address: 'BidCoS-RF:6',
                            name: 'HM-RCV-50 BidCoS-RF:6'
                        },
                        {
                            id: '1037',
                            address: 'BidCoS-RF:7',
                            name: 'HM-RCV-50 BidCoS-RF:7'
                        },
                        {
                            id: '1041',
                            address: 'BidCoS-RF:8',
                            name: 'HM-RCV-50 BidCoS-RF:8'
                        },
                        {
                            id: '1045',
                            address: 'BidCoS-RF:9',
                            name: 'HM-RCV-50 BidCoS-RF:9'
                        },
                        {
                            id: '1049',
                            address: 'BidCoS-RF:10',
                            name: 'HM-RCV-50 BidCoS-RF:10'
                        },
                        {
                            id: '1053',
                            address: 'BidCoS-RF:11',
                            name: 'HM-RCV-50 BidCoS-RF:11'
                        },
                        {
                            id: '1057',
                            address: 'BidCoS-RF:12',
                            name: 'HM-RCV-50 BidCoS-RF:12'
                        },
                        {
                            id: '1061',
                            address: 'BidCoS-RF:13',
                            name: 'HM-RCV-50 BidCoS-RF:13'
                        },
                        {
                            id: '1065',
                            address: 'BidCoS-RF:14',
                            name: 'HM-RCV-50 BidCoS-RF:14'
                        },
                        {
                            id: '1069',
                            address: 'BidCoS-RF:15',
                            name: 'HM-RCV-50 BidCoS-RF:15'
                        },
                        {
                            id: '1073',
                            address: 'BidCoS-RF:16',
                            name: 'HM-RCV-50 BidCoS-RF:16'
                        },
                        {
                            id: '1077',
                            address: 'BidCoS-RF:17',
                            name: 'HM-RCV-50 BidCoS-RF:17'
                        },
                        {
                            id: '1081',
                            address: 'BidCoS-RF:18',
                            name: 'HM-RCV-50 BidCoS-RF:18'
                        },
                        {
                            id: '1085',
                            address: 'BidCoS-RF:19',
                            name: 'HM-RCV-50 BidCoS-RF:19'
                        },
                        {
                            id: '1089',
                            address: 'BidCoS-RF:20',
                            name: 'HM-RCV-50 BidCoS-RF:20'
                        },
                        {
                            id: '1093',
                            address: 'BidCoS-RF:21',
                            name: 'HM-RCV-50 BidCoS-RF:21'
                        },
                        {
                            id: '1097',
                            address: 'BidCoS-RF:22',
                            name: 'HM-RCV-50 BidCoS-RF:22'
                        },
                        {
                            id: '1101',
                            address: 'BidCoS-RF:23',
                            name: 'HM-RCV-50 BidCoS-RF:23'
                        },
                        {
                            id: '1105',
                            address: 'BidCoS-RF:24',
                            name: 'HM-RCV-50 BidCoS-RF:24'
                        },
                        {
                            id: '1109',
                            address: 'BidCoS-RF:25',
                            name: 'HM-RCV-50 BidCoS-RF:25'
                        },
                        {
                            id: '1113',
                            address: 'BidCoS-RF:26',
                            name: 'HM-RCV-50 BidCoS-RF:26'
                        },
                        {
                            id: '1117',
                            address: 'BidCoS-RF:27',
                            name: 'HM-RCV-50 BidCoS-RF:27'
                        },
                        {
                            id: '1121',
                            address: 'BidCoS-RF:28',
                            name: 'HM-RCV-50 BidCoS-RF:28'
                        },
                        {
                            id: '1125',
                            address: 'BidCoS-RF:29',
                            name: 'HM-RCV-50 BidCoS-RF:29'
                        },
                        {
                            id: '1129',
                            address: 'BidCoS-RF:30',
                            name: 'HM-RCV-50 BidCoS-RF:30'
                        },
                        {
                            id: '1133',
                            address: 'BidCoS-RF:31',
                            name: 'HM-RCV-50 BidCoS-RF:31'
                        },
                        {
                            id: '1137',
                            address: 'BidCoS-RF:32',
                            name: 'HM-RCV-50 BidCoS-RF:32'
                        },
                        {
                            id: '1141',
                            address: 'BidCoS-RF:33',
                            name: 'HM-RCV-50 BidCoS-RF:33'
                        },
                        {
                            id: '1145',
                            address: 'BidCoS-RF:34',
                            name: 'HM-RCV-50 BidCoS-RF:34'
                        },
                        {
                            id: '1149',
                            address: 'BidCoS-RF:35',
                            name: 'HM-RCV-50 BidCoS-RF:35'
                        },
                        {
                            id: '1153',
                            address: 'BidCoS-RF:36',
                            name: 'HM-RCV-50 BidCoS-RF:36'
                        },
                        {
                            id: '1157',
                            address: 'BidCoS-RF:37',
                            name: 'HM-RCV-50 BidCoS-RF:37'
                        },
                        {
                            id: '1161',
                            address: 'BidCoS-RF:38',
                            name: 'HM-RCV-50 BidCoS-RF:38'
                        },
                        {
                            id: '1165',
                            address: 'BidCoS-RF:39',
                            name: 'HM-RCV-50 BidCoS-RF:39'
                        },
                        {
                            id: '1169',
                            address: 'BidCoS-RF:40',
                            name: 'HM-RCV-50 BidCoS-RF:40'
                        },
                        {
                            id: '1173',
                            address: 'BidCoS-RF:41',
                            name: 'HM-RCV-50 BidCoS-RF:41'
                        },
                        {
                            id: '1177',
                            address: 'BidCoS-RF:42',
                            name: 'HM-RCV-50 BidCoS-RF:42'
                        },
                        {
                            id: '1181',
                            address: 'BidCoS-RF:43',
                            name: 'HM-RCV-50 BidCoS-RF:43'
                        },
                        {
                            id: '1185',
                            address: 'BidCoS-RF:44',
                            name: 'HM-RCV-50 BidCoS-RF:44'
                        },
                        {
                            id: '1189',
                            address: 'BidCoS-RF:45',
                            name: 'HM-RCV-50 BidCoS-RF:45'
                        },
                        {
                            id: '1193',
                            address: 'BidCoS-RF:46',
                            name: 'HM-RCV-50 BidCoS-RF:46'
                        },
                        {
                            id: '1197',
                            address: 'BidCoS-RF:47',
                            name: 'HM-RCV-50 BidCoS-RF:47'
                        },
                        {
                            id: '1201',
                            address: 'BidCoS-RF:48',
                            name: 'HM-RCV-50 BidCoS-RF:48'
                        },
                        {
                            id: '1205',
                            address: 'BidCoS-RF:49',
                            name: 'HM-RCV-50 BidCoS-RF:49'
                        },
                        {
                            id: '1209',
                            address: 'BidCoS-RF:50',
                            name: 'HM-RCV-50 BidCoS-RF:50'
                        }
                    ]);
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
                    data.should.deepEqual([
                        { id: '1220', name: 'funcButton', channels: [] },
                        {
                            id: '1221',
                            name: 'funcCentral',
                            channels: [
                                1013,
                                    1049,
                                    1053,
                                    1057,
                                    1061,
                                    1065,
                                    1069,
                                    1073,
                                    1077,
                                    1081,
                                    1085,
                                    1017,
                                    1089,
                                    1093,
                                    1097,
                                    1101,
                                    1105,
                                    1109,
                                    1113,
                                    1117,
                                    1121,
                                    1125,
                                    1021,
                                    1129,
                                    1133,
                                    1137,
                                    1141,
                                    1145,
                                    1149,
                                    1153,
                                    1157,
                                    1161,
                                    1165,
                                    1025,
                                    1169,
                                    1173,
                                    1177,
                                    1181,
                                    1185,
                                    1189,
                                    1193,
                                    1197,
                                    1201,
                                    1205,
                                    1029,
                                    1209,
                                    1033,
                                    1037,
                                    1041,
                                    1045
                                ]
                        },
                        { id: '1215', name: 'funcClimateControl', channels: [] },
                        { id: '1222', name: 'funcEnergy', channels: [] },
                        { id: '1217', name: 'funcEnvironment', channels: [] },
                        { id: '1214', name: 'funcHeating', channels: [] },
                        { id: '1213', name: 'funcLight', channels: [] },
                        { id: '1219', name: 'funcLock', channels: [] },
                        { id: '1218', name: 'funcSecurity', channels: [] },
                        { id: '1216', name: 'funcWeather', channels: [] }
                    ]);
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
                    data.should.deepEqual([
                        { id: '1229', name: 'roomBathroom', channels: [] },
                        { id: '1225', name: 'roomBedroom', channels: [] },
                        { id: '1226', name: 'roomChildrensRoom1', channels: [] },
                        { id: '1227', name: 'roomChildrensRoom2', channels: [] },
                        { id: '1230', name: 'roomGarage', channels: [] },
                        { id: '1232', name: 'roomGarden', channels: [] },
                        { id: '1231', name: 'roomHWR', channels: [] },
                        { id: '1224', name: 'roomKitchen', channels: [] },
                        { id: '1223', name: 'roomLivingRoom', channels: [] },
                        { id: '1228', name: 'roomOffice', channels: [] },
                        { id: '1233', name: 'roomTerrace', channels: [] }
                    ]);
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
