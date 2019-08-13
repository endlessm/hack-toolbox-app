/* exported Section */

const {GObject, Gtk} = imports.gi;

var Section = GObject.registerClass({
    GTypeName: 'Section',

    Properties: {
        heading: GObject.ParamSpec.string('heading', 'Heading', '',
            GObject.ParamFlags.READWRITE, ''),
    },

    Template: 'resource:///com/hack_computer/HackToolbox/section.ui',
    InternalChildren: ['label'],
}, class Section extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);
    }

    get heading() {
        return this._label.label;
    }

    set heading(value) {
        if (this._label.label === value)
            return;
        this._label.label = value;
        this.notify('heading');
    }
});
