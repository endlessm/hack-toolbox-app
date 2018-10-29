/* exported HUModelGlobal */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var HUModelGlobal = GObject.registerClass({
    Properties: {
        amplitude: GObject.ParamSpec.double(
            'amplitude', 'amplitude', '',
            _propFlags, 0.0, 0.7, 0.2),
        frequency: GObject.ParamSpec.double(
            'frequency', 'frequency', '',
            _propFlags, 0.0, 50.0, 20.0),
        phase: GObject.ParamSpec.double(
            'phase', 'phase', '',
            _propFlags, -3.0, 3.0, 0.0),
    },
}, class HUModelGlobal extends ClippyWrapper {
    _init(props = {}) {
        props.busName = 'com.endlessm.HackUnlock';
        super._init(props);
    }
});
