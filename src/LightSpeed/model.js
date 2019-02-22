/* exported LSModel */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var LSModel = GObject.registerClass({
    Properties: {
        scoreTarget: GObject.ParamSpec.double('scoreTarget', 'Score target', '',
            _propFlags, 1, Number.MAX_SAFE_INTEGER, 5),
        timeLimit: GObject.ParamSpec.double('timeLimit', 'Time limit', '',
            _propFlags, -1, Number.MAX_SAFE_INTEGER, -1),
        astronautSize: GObject.ParamSpec.double('astronautSize', 'Astronaut size', '',
            _propFlags, 1, 2000, 30),
        shipAsset: GObject.ParamSpec.string('shipAsset', 'Ship asset', '',
            _propFlags, 'ship'),
        shipSize: GObject.ParamSpec.double('shipSize', 'Ship size', '',
            _propFlags, 1, 2000, 50),
        shipSpeed: GObject.ParamSpec.double('shipSpeed', 'Ship speed', '',
            _propFlags, 0, Number.MAX_SAFE_INTEGER, 500),
        shipAcceleration: GObject.ParamSpec.double('shipAcceleration',
            'Ship acceleration', '', _propFlags, 0, Number.MAX_SAFE_INTEGER, 500),
        spawnEnemyCode: GObject.ParamSpec.string('spawnEnemyCode',
            'Spawn enemy code', '', _propFlags, ''),
        updateAsteroidCode: GObject.ParamSpec.string('updateAsteroidCode',
            'Update asteroid code', '', _propFlags, ''),
        updateSpinnerCode: GObject.ParamSpec.string('updateSpinnerCode',
            'Update spinner code', '', _propFlags, ''),
        updateSquidCode: GObject.ParamSpec.string('updateSquidCode',
            'Update squid code', '', _propFlags, ''),
        updateBeamCode: GObject.ParamSpec.string('updateBeamCode',
            'Update beam code', '', _propFlags, ''),
    },
}, class LSModel extends ClippyWrapper {
    _init(level, props = {}) {
        super._init('com.endlessm.LightSpeed', props, `globalLevel${level}Parameters`);
    }
});
