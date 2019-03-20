/* exported OSControlPanel */

const {GObject, Gtk} = imports.gi;
const {Codeview} = imports.codeview;
const {CursorImage, cursorIDToResource} = imports.OperatingSystemApp.cursorImage;
const {Section} = imports.section;
const {SpinInput} = imports.spinInput;
const {PopupMenu} = imports.popupMenu;
const {VALID_CURSORS} = imports.OperatingSystemApp.oscursormodel;

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
        // Setup icons path
        var theme = Gtk.IconTheme.get_default();
        theme.add_resource_path('/com/endlessm/HackToolbox/OperatingSystemApp/icons');

        super._init(props);

        // Temporary fix for keeping the toolbox the same height as it was in
        // the old design
        this._codeview.minContentHeight = 424;

        const cursorChoices = {};
        VALID_CURSORS.forEach(cursor => {
            cursorChoices[cursor] = cursorIDToResource(cursor);
        });
        this._cursorGroup = new PopupMenu(this._cursorButton, cursorChoices,
            CursorImage, 'resource', {});

        this._previous_size = this._cursorSizeAdjustment.value;
        this._cursorSizeAdjustment.connect('value-changed', this._snapSizeToOption.bind(this));
    }

    bindModel(model) {
        this._cursor = model;

        const bindingInfo = [
            ['theme', this._cursorGroup],
            ['size', this._cursorSizeAdjustment],
            ['speed', this._cursorSpeedAdjustment],
        ];
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;
        this._bindings = bindingInfo.map(args =>
            this._cursor.bind_property(...args, 'value', flags));
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
