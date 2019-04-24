/* exported RMZGlobalModel */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;
const {RMZModel} = imports.RileyMaze.model;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var RMZGlobalModel = GObject.registerClass({
    Properties: {
        availableLevels: GObject.ParamSpec.double('availableLevels', 'Available levels', '',
            _propFlags, 0, Number.MAX_SAFE_INTEGER, 2),
        currentLevel: GObject.ParamSpec.double('currentLevel', 'Current level', '',
            _propFlags, 0, Number.MAX_SAFE_INTEGER, 0),
    },
}, class RMZGlobalModel extends ClippyWrapper {
    _init(level, props = {}) {
        super._init('com.endlessm.Sidetrack', props);
        this._models = [];
    }

    getModel(level) {
        if (typeof this._models[level] === 'undefined')
            this._models[level] = new RMZModel(level);
        return this._models[level];
    }
});
