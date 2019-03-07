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
