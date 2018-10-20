/* exported OSControlPanel, OSModel */

const {Gio, GObject, Gtk} = imports.gi;
const {Codeview} = imports.codeview;
const {Lockscreen} = imports.lockscreen;

GObject.type_ensure(Codeview.$gtype);
GObject.type_ensure(Lockscreen.$gtype);

var _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var OSModel = GObject.registerClass({
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
}, class OSModel extends GObject.Object {
    _init(props = {}) {
        super._init(props);

        this._settings = new Gio.Settings({
            schemaId: 'org.gnome.shell',
            path: '/org/gnome/shell/',
        });

        this._keys = this._settings.settings_schema.list_keys();

        this._bindSetting('wobbly-effect', 'wobblyEffect');
        this._bindSetting('wobbly-object-movement-range', 'wobblyObjectMovementRange');
        this._bindSetting('wobbly-slowdown-factor', 'wobblySlowdownFactor');
        this._bindSetting('wobbly-spring-friction', 'wobblySpringFriction');
        this._bindSetting('wobbly-spring-k', 'wobblySpringK');
    }

    _bindSetting(setting, property) {
        if (this._keys && this._keys.includes(setting))
            this._settings.bind(setting, this, property, Gio.SettingsBindFlags.DEFAULT);
    }
});

var OSControlPanel = GObject.registerClass({
    GTypeName: 'OSControlPanel',
    Properties: {
        model: GObject.ParamSpec.object('model', 'Model', '',
            GObject.ParamFlags.READABLE,
            OSModel),
    },
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

        this.model = new OSModel();
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        this.model.bind_property('wobblyEffect', this._wobblyCheck,
            'active', flags);
        this.model.bind_property('wobblyObjectMovementRange', this._movementAdjustment,
            'value', flags);
        this.model.bind_property('wobblySlowdownFactor', this._slowdownAdjustment,
            'value', flags);
        this.model.bind_property('wobblySpringFriction', this._frictionAdjustment,
            'value', flags);
        this.model.bind_property('wobblySpringK', this._springAdjustment,
            'value', flags);
    }
});

