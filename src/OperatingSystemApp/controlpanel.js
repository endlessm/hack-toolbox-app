/* exported OSControlPanel */

const {GObject, Gtk} = imports.gi;
const {Codeview} = imports.codeview;
const {CursorImage, cursorIDToResource} = imports.OperatingSystemApp.cursorImage;
const {OSCursorModel, VALID_CURSORS} = imports.OperatingSystemApp.oscursormodel;
const {Section} = imports.section;
const {SpinInput} = imports.spinInput;
const {PopupMenu} = imports.popupMenu;

GObject.type_ensure(Codeview.$gtype);
GObject.type_ensure(Section.$gtype);
GObject.type_ensure(SpinInput.$gtype);

var OSControlPanel = GObject.registerClass({
    GTypeName: 'OSControlPanel',
    Template: 'resource:///com/endlessm/HackToolbox/OperatingSystemApp/controlpanel.ui',
    Children: [
        'codeLock',
    ],
    InternalChildren: [
        'codeview',
        'cursorButton',
        'cursorSizeAdjustment',
        'cursorSpeedAdjustment',
    ],
}, class OSControlPanel extends Gtk.Grid {
    _init(props = {}) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;

        /* Setup icons path */
        var theme = Gtk.IconTheme.get_default();
        theme.add_resource_path('/com/endlessm/HackToolbox/OperatingSystemApp/icons');

        super._init(props);

        // Temporary fix for keeping the toolbox the same height as it was in
        // the old design
        this._codeview.minContentHeight = 424;

        /* Create data model for editable properties */
        this._cursor = new OSCursorModel();

        const cursorChoices = {};
        VALID_CURSORS.forEach(cursor => {
            cursorChoices[cursor] = cursorIDToResource(cursor);
        });
        this._cursorGroup = new PopupMenu(this._cursorButton, cursorChoices,
            CursorImage, 'resource', {});

        /* Bind model properties with UI elements */
        this._cursor.bind_property('theme', this._cursorGroup, 'value', flags);
        this._cursor.bind_property('size', this._cursorSizeAdjustment, 'value', flags);
        this._cursor.bind_property('speed', this._cursorSpeedAdjustment, 'value', flags);

        this._previous_size = this._cursorSizeAdjustment.value;
        this._cursorSizeAdjustment.connect('value-changed', this._snapSizeToOption.bind(this));
    }

    reset() {
        this._cursor.reset();
    }

    _snapSizeToOption() {
        let size = this._cursorSizeAdjustment.value;
        if (size === this._previous_size)
            return;

        const options = [16, 24, 32, 48, 64, 96, 128, 192, 256];
        const increasing = size - this._previous_size > 0;

        if (!increasing)
            options.reverse();

        for (const index in options) {
            if (increasing && size <= options[index] || !increasing && size >= options[index]) {
                size = options[index];
                this._previous_size = size;
                break;
            }
        }

        this._cursorSizeAdjustment.value = size;
    }
});
