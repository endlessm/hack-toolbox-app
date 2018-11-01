/* exported OSWobblyModel */

const {Gio, GObject} = imports.gi;
const {OSModel} = imports.OperatingSystemApp.osmodel;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var OSWobblyModel = GObject.registerClass({
    Properties: {
        wobblyEffect: GObject.ParamSpec.boolean(
            'wobblyEffect', 'Wobbly Effect', '',
            _propFlags, false),
        wobblyObjectMovementRange: GObject.ParamSpec.double(
            'wobblyObjectMovementRange', 'Wobbly Object Movement Range', '',
            _propFlags, 10.0, 500.0, 100.0),
        wobblySlowdownFactor: GObject.ParamSpec.double(
            'wobblySlowdownFactor', 'Wobbly Slowdown Factor', '',
            _propFlags, 1.0, 5.0, 1.0),
        wobblySpringFriction: GObject.ParamSpec.double(
            'wobblySpringFriction', 'Wobbly Spring Friction', '',
            _propFlags, 2.0, 10.0, 3.0),
        wobblySpringK: GObject.ParamSpec.double(
            'wobblySpringK', 'Wobbly Spring K', '',
            _propFlags, 2.0, 10.0, 8.0),
    },
}, class OSWobblyModel extends OSModel {
    _init() {
        super._init();

        var settings = new Gio.Settings({
            schemaId: 'org.gnome.shell',
            path: '/org/gnome/shell/',
        });

        this.bindSetting(settings, 'wobbly-effect', 'wobblyEffect');
        this.bindSetting(settings, 'wobbly-object-movement-range', 'wobblyObjectMovementRange');
        this.bindSetting(settings, 'wobbly-slowdown-factor', 'wobblySlowdownFactor');
        this.bindSetting(settings, 'wobbly-spring-friction', 'wobblySpringFriction');
        this.bindSetting(settings, 'wobbly-spring-k', 'wobblySpringK');
    }
});
