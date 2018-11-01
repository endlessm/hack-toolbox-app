/* exported SpinInput */

const {GObject, Gtk} = imports.gi;

var SpinInput = GObject.registerClass({
    GTypeName: 'SpinInput',
    Properties: {
        label: GObject.ParamSpec.string(
            'label', 'Label', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ''),
        digits: GObject.ParamSpec.int(
            'digits', 'Digits', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            0, 20, 0),
        adjustment: GObject.ParamSpec.object(
            'adjustment', 'Adjustment', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            Gtk.Adjustment),
    },
    Template: 'resource:///com/endlessm/HackToolbox/spininput.ui',
    InternalChildren: ['input', 'label'],
}, class SpinInput extends Gtk.Box {
    _init(props) {
        super._init(props);
        this._input.set_adjustment(this.adjustment);
        this._input.set_digits(this.digits);
        this._label.label = this.label;
    }
});
