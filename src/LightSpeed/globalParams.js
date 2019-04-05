/* exported LSGlobalModel */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;
const {LSModel} = imports.LightSpeed.model;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var LSGlobalModel = GObject.registerClass({
    Properties: {
        availableLevels: GObject.ParamSpec.double('availableLevels', 'Available levels', '',
            _propFlags, 0, Number.MAX_SAFE_INTEGER, 2),
        currentLevel: GObject.ParamSpec.double('currentLevel', 'Current level', '',
            _propFlags, 0, Number.MAX_SAFE_INTEGER, 0),
        updateAsteroidCode: GObject.ParamSpec.string('updateAsteroidCode',
            'Update asteroid code', '', _propFlags, ''),
        updateSpinnerCode: GObject.ParamSpec.string('updateSpinnerCode',
            'Update spinner code', '', _propFlags, ''),
        updateSquidCode: GObject.ParamSpec.string('updateSquidCode',
            'Update squid code', '', _propFlags, ''),
        updateBeamCode: GObject.ParamSpec.string('updateBeamCode',
            'Update beam code', '', _propFlags, ''),
        activatePowerupCode: GObject.ParamSpec.string('activatePowerupCode',
            'Activate powerup code', '', _propFlags, ''),
    },
}, class LSGlobalModel extends ClippyWrapper {
    _init(level, props = {}) {
        super._init('com.endlessm.LightSpeed', props);
        this._models = [];
    }

    getModel(level) {
        if (typeof this._models[level] === 'undefined')
            this._models[level] = new LSModel(level);
        return this._models[level];
    }
});
