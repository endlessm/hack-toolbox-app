/* exported FizzicsModelGlobal */

const {GLib, GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var FizzicsModelGlobal = GObject.registerClass({
    Properties: {
        backgroundImageIndex: GObject.ParamSpec.uint(
            'backgroundImageIndex', 'backgroundImageIndex', '',
            _propFlags, 0, GLib.MAXUINT32, 0),

        'radius-0': GObject.ParamSpec.double(
            'radius-0', 'radius-0', '',
            _propFlags, 10.0, 100.0, 30.0),
        'gravity-0': GObject.ParamSpec.double(
            'gravity-0', 'gravity-0', '',
            _propFlags, -50.0, 50.0, 20.0),
        'collision-0': GObject.ParamSpec.double(
            'collision-0', 'collision-0', '',
            _propFlags, 0.0, 0.2, 0.2),
        'friction-0': GObject.ParamSpec.double(
            'friction-0', 'friction-0', '',
            _propFlags, 0.0, 18.0, 2.0),
        'usePhysics-0': GObject.ParamSpec.boolean(
            'usePhysics-0', 'usePhysics-0', '',
            _propFlags, true),
        'socialForce-0-0': GObject.ParamSpec.double(
            'socialForce-0-0', 'socialForce-0-0', '',
            _propFlags, -30.0, 30.0, -8.0),
        'socialForce-0-1': GObject.ParamSpec.double(
            'socialForce-0-1', 'socialForce-0-1', '',
            _propFlags, -30.0, 30.0, 0.0),
        'socialForce-0-2': GObject.ParamSpec.double(
            'socialForce-0-2', 'socialForce-0-2', '',
            _propFlags, -30.0, 30.0, 0.0),
        'imageIndex-0': GObject.ParamSpec.uint(
            'imageIndex-0', 'imageIndex-0', '',
            _propFlags, 0, 8, 0),

        'radius-1': GObject.ParamSpec.double(
            'radius-1', 'radius-1', '',
            _propFlags, 10.0, 100.0, 50.0),
        'gravity-1': GObject.ParamSpec.double(
            'gravity-1', 'gravity-1', '',
            _propFlags, -50.0, 50.0, 0.0),
        'collision-1': GObject.ParamSpec.double(
            'collision-1', 'collision-1', '',
            _propFlags, 0.0, 0.2, 0.2),
        'friction-1': GObject.ParamSpec.double(
            'friction-1', 'friction-1', '',
            _propFlags, 0.0, 18.0, 5.0),
        'usePhysics-1': GObject.ParamSpec.boolean(
            'usePhysics-1', 'usePhysics-1', '',
            _propFlags, true),
        'socialForce-1-0': GObject.ParamSpec.double(
            'socialForce-1-0', 'socialForce-1-0', '',
            _propFlags, -30.0, 30.0, -20.0),
        'socialForce-1-1': GObject.ParamSpec.double(
            'socialForce-1-1', 'socialForce-1-1', '',
            _propFlags, -30.0, 30.0, 0.0),
        'socialForce-1-2': GObject.ParamSpec.double(
            'socialForce-1-2', 'socialForce-1-2', '',
            _propFlags, -30.0, 30.0, 20.0),
        'imageIndex-1': GObject.ParamSpec.uint(
            'imageIndex-1', 'imageIndex-1', '',
            _propFlags, 0, 8, 1),

        'radius-2': GObject.ParamSpec.double(
            'radius-2', 'radius-2', '',
            _propFlags, 10.0, 100.0, 30.0),
        'gravity-2': GObject.ParamSpec.double(
            'gravity-2', 'gravity-2', '',
            _propFlags, -50.0, 50.0, 8.0),
        'collision-2': GObject.ParamSpec.double(
            'collision-2', 'collision-2', '',
            _propFlags, 0.0, 0.2, 0.2),
        'friction-2': GObject.ParamSpec.double(
            'friction-2', 'friction-2', '',
            _propFlags, 0.0, 18.0, 10.0),
        'usePhysics-2': GObject.ParamSpec.boolean(
            'usePhysics-2', 'usePhysics-2', '',
            _propFlags, true),
        'socialForce-2-0': GObject.ParamSpec.double(
            'socialForce-2-0', 'socialForce-2-0', '',
            _propFlags, -30.0, 30.0, 0.0),
        'socialForce-2-1': GObject.ParamSpec.double(
            'socialForce-2-1', 'socialForce-2-1', '',
            _propFlags, -30.0, 30.0, 0.0),
        'socialForce-2-2': GObject.ParamSpec.double(
            'socialForce-2-2', 'socialForce-2-2', '',
            _propFlags, -30.0, 30.0, -10.0),
        'imageIndex-2': GObject.ParamSpec.uint(
            'imageIndex-2', 'imageIndex-2', '',
            _propFlags, 0, 8, 2),
    },
}, class FizzicsModelGlobal extends ClippyWrapper {
    _init(props = {}) {
        props.appId = 'com.endlessm.Fizzics';
        super._init(props);
    }
});
