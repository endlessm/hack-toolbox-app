/* exported Toolbox */

const {GObject, Gtk} = imports.gi;

var Toolbox = GObject.registerClass({
    CssName: 'toolbox',
    Signals: {
        reset: {},
    },
}, class Toolbox extends Gtk.Grid {
    _init(props = {}) {
        props.orientation = Gtk.Orientation.VERTICAL;
        super._init(props);

        const headerbar = new Gtk.HeaderBar({hasSubtitle: false});
        const buttonReset = new Gtk.Button();
        const image = new Gtk.Image({stock: 'gtk-revert-to-saved'});
        buttonReset.add(image);
        headerbar.pack_end(buttonReset);
        headerbar.show_all();
        this.add(headerbar);

        buttonReset.connect('clicked', () => this.emit('reset'));
    }
});
