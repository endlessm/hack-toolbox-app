/* exported OSControlPanel */

const {Gio, GObject, Gtk} = imports.gi;
const {Codeview} = imports.codeview;
const {Lockscreen} = imports.lockscreen;

var _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var OSModel = GObject.registerClass({
    Properties: {
        radius0: GObject.ParamSpec.double(
            'wobblyEffect', 'Wobbly Effect', '',
            _propFlags, 10.0, 100.0, 30.0),
        gravity0: GObject.ParamSpec.double(
            'wobblyObjectMovementRange', 'Wobbly Object Movement Range', '',
            _propFlags, -50.0, 50.0, 20.0),
        collision0: GObject.ParamSpec.double(
            'wobblySlowdownFactor', 'Wobbly Slowdown Factor', '',
            _propFlags, 0.0, 0.2, 0.2),
        friction0: GObject.ParamSpec.double(
            'wobblySpringFriction', 'Wobbly Spring Friction', '',
            _propFlags, 0.0, 18.0, 2.0),
        friction0: GObject.ParamSpec.double(
            'wobblySpringK', 'Wobbly Spring K', '',
            _propFlags, 0.0, 18.0, 2.0),
    },
}, class OSModel extends GObject.Object {
    _init(props = {}) {
        super._init(props);

        this._settings = new Gio.Settings ({
            schemaId: 'org.gnome.shell',
            path: '/org/gnome/shell/'
        });

        this._keys = this._settings.settings_schema.list_keys ();

        this.bindSetting ('wobbly-effect', this, 'wobblyEffect');
        this.bindSetting ('wobbly-object-movement-range', this, 'wobblyObjectMovementRange');
        this.bindSetting ('wobbly-slowdown-factor', this, 'wobblySlowdownFactor');
        this.bindSetting ('wobbly-spring-friction', this, 'wobblySpringFriction');
        this.bindSetting ('wobbly-spring-k', this, 'wobblySpringK');
    }

    bindSetting(setting, object, property) {
        if (this._keys && this._keys.includes(setting))
            this._settings.bind (setting, object, property, Gio.SettingsBindFlags.DEFAULT);
    }
});

var OSControlPanel = GObject.registerClass({
    GTypeName: 'OSControlPanel',
    Template: 'resource:///com/endlessm/HackToolbox/OperatingSystemApp/controlpanel.ui',
    InternalChildren: [
        'wobblyCheck',
        'movementAdjustment',
        'slowdownAdjustment',
        'frictionAdjustment',
        'springAdjustment',
        'codeview',
    ],
}, class OSControlPanel extends Gtk.Box {
    _init(props = {}) {
        super._init(props);

        this._model = new OSModel ();

        this._model.bindSetting ('wobbly-effect', this._wobblyCheck, 'active');
        this._model.bindSetting ('wobbly-object-movement-range', this._movementAdjustment, 'value');
        this._model.bindSetting ('wobbly-slowdown-factor', this._slowdownAdjustment, 'value');
        this._model.bindSetting ('wobbly-spring-friction', this._frictionAdjustment, 'value');
        this._model.bindSetting ('wobbly-spring-k', this._springAdjustment, 'value');
    }
});

