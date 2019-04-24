/* exported RMZModel */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var RMZModel = GObject.registerClass({
    Properties: {
        robotADirection: GObject.ParamSpec.string('robotADirection', 'Robot A direction', 'up',
            _propFlags, 'up'),
        robotBDirection: GObject.ParamSpec.string('robotBDirection', 'Robot B direction', 'up',
            _propFlags, 'up'),
        instructionCode: GObject.ParamSpec.string('instructionCode', 'Instruction code', '',
            _propFlags, ''),
        levelCode: GObject.ParamSpec.string('levelCode', 'level code', '', _propFlags, ''),
    },
}, class RMZModel extends ClippyWrapper {
    _init(level, props = {}) {
        super._init('com.endlessm.Sidetrack', props, `globalLevel${level}Parameters`);
    }
});
