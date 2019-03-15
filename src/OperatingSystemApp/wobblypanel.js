/* exported WobblyPanel */

const {GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;
const {OSWobblyModel} = imports.OperatingSystemApp.oswobblymodel;
const {Section} = imports.section;
const {WobblyLockscreen} = imports.OperatingSystemApp.wobblyLockscreen;

GObject.type_ensure(Codeview.$gtype);
GObject.type_ensure(Section.$gtype);
GObject.type_ensure(WobblyLockscreen.$gtype);

var WobblyPanel = GObject.registerClass({
    GTypeName: 'WobblyPanel',
    Template: 'resource:///com/endlessm/HackToolbox/OperatingSystemApp/wobblypanel.ui',
    Children: [
        'wobblyLock',
    ],
    InternalChildren: [
        'codeLock',
        'codeview',
        'frictionAdjustment',
        'movementAdjustment',
        'slowdownAdjustment',
        'springAdjustment',
        'wobblyCheck',
    ],
}, class WobblyPanel extends Gtk.Grid {
    _init(props = {}) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;

        /* Setup icons path */
        var theme = Gtk.IconTheme.get_default();
        theme.add_resource_path('/com/endlessm/HackToolbox/OperatingSystemApp/icons');

        super._init(props);

        // Temporary fix for keeping the toolbox the same height as it was in
        // the old design
        this._codeview.minContentHeight = 424;

        this._wobbly = new OSWobblyModel();
        this._wobbly.bind_property('wobblyEffect', this._wobblyCheck, 'active', flags);
        this._wobbly.bind_property('wobblyObjectMovementRange', this._movementAdjustment,
            'value', flags);
        this._wobbly.bind_property('wobblySlowdownFactor', this._slowdownAdjustment,
            'value', flags);
        this._wobbly.bind_property('wobblySpringFriction', this._frictionAdjustment,
            'value', flags);
        this._wobbly.bind_property('wobblySpringK', this._springAdjustment,
            'value', flags);
    }

    reset() {
        this._wobbly.reset();
    }
});
