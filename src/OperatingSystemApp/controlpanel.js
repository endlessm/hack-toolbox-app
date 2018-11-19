/* exported OSControlPanel */

const {GObject, Gtk} = imports.gi;
const {Codeview} = imports.codeview;
const {Lockscreen} = imports.lockscreen;
const {OSCursorModel} = imports.OperatingSystemApp.oscursormodel;
const {OSWobblyModel} = imports.OperatingSystemApp.oswobblymodel;
const {Section} = imports.section;
const {SpinInput} = imports.spinInput;

GObject.type_ensure(Codeview.$gtype);
GObject.type_ensure(Lockscreen.$gtype);
GObject.type_ensure(Section.$gtype);
GObject.type_ensure(SpinInput.$gtype);

var OSControlPanel = GObject.registerClass({
    GTypeName: 'OSControlPanel',
    Template: 'resource:///com/endlessm/HackToolbox/OperatingSystemApp/controlpanel.ui',
    Children: [
        'codeLock',
        'wobblyLock',
    ],
    InternalChildren: [
        'codeview',
        'cursorRadiobutton',
        'cursorImage',
        'cursorSizeAdjustment',
        'cursorSpeedAdjustment',
        'frictionAdjustment',
        'movementAdjustment',
        'slowdownAdjustment',
        'springAdjustment',
        'wobblyCheck',
    ],
}, class OSControlPanel extends Gtk.Grid {
    _init(props = {}) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;

        /* Setup icons path */
        var theme = Gtk.IconTheme.get_default();
        theme.add_resource_path('/com/endlessm/HackToolbox/OperatingSystemApp/icons');

        super._init(props);

        /* Create data models for editable properties */
        this._cursor = new OSCursorModel();
        this._wobbly = new OSWobblyModel();

        /* Bind model properties with UI elements */
        this._cursor.bind_property('theme', this._cursorImage, 'icon_name', flags);
        this._cursor.bind_property('size', this._cursorSizeAdjustment, 'value', flags);
        this._cursor.bind_property('speed', this._cursorSpeedAdjustment, 'value', flags);

        this._wobbly.bind_property('wobblyEffect', this._wobblyCheck, 'active', flags);
        this._wobbly.bind_property('wobblyObjectMovementRange', this._movementAdjustment,
            'value', flags);
        this._wobbly.bind_property('wobblySlowdownFactor', this._slowdownAdjustment,
            'value', flags);
        this._wobbly.bind_property('wobblySpringFriction', this._frictionAdjustment,
            'value', flags);
        this._wobbly.bind_property('wobblySpringK', this._springAdjustment,
            'value', flags);

        /* Connect to cursor radio buttons toggled signals */
        this._cursorRadiobutton.get_group().forEach(button => {
            button.connect('toggled', () => {
                if (!button.active)
                    return;

                this._cursor.theme = button.get_child().icon_name;
            });
        });

        this._cursor.connect('notify::theme', this._refreshRadioGroup.bind(this));
    }

    reset () {
        this._cursor.reset();
        this._wobbly.reset();
    }

    _refreshRadioGroup() {
        var group = this._cursorRadiobutton.get_group();

        for (var button of group) {
            if (button.get_child().icon_name === this._cursor.theme) {
                button.set_active(true);
                break;
            }
        }
    }
});

