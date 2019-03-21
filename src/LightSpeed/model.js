/* exported LSModel */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var LSModel = GObject.registerClass({
    Properties: {
        scoreTarget: GObject.ParamSpec.double('scoreTarget', 'Score target', '',
            _propFlags, 1, Number.MAX_SAFE_INTEGER, 5),
        astronautSize: GObject.ParamSpec.double('astronautSize', 'Astronaut size', '',
            _propFlags, 1, 2000, 30),
        shipAsset: GObject.ParamSpec.string('shipAsset', 'Ship asset', '',
            _propFlags, 'ship'),
        shipSize: GObject.ParamSpec.double('shipSize', 'Ship size', '',
            _propFlags, 1, 2000, 50),
        shipSpeed: GObject.ParamSpec.double('shipSpeed', 'Ship speed', '',
            _propFlags, 0, Number.MAX_SAFE_INTEGER, 500),
        spawnEnemyCode: GObject.ParamSpec.string('spawnEnemyCode',
            'Spawn enemy code', '', _propFlags, ''),
    },
}, class LSModel extends ClippyWrapper {
    _init(level, props = {}) {
        super._init('com.endlessm.LightSpeed', props, `globalLevel${level}Parameters`);
    }
});
