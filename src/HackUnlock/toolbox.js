/* exported HUToolbox */

const {GObject, Gtk} = imports.gi;

const {HUControlPanel} = imports.HackUnlock.controlpanel;
const {HUModelGlobal} = imports.HackUnlock.model;

// The HackUnlock toolbox is separate from the normal Toolbox parent class. It's
// got an entirely different design.
var HUToolbox = GObject.registerClass({
    CssName: 'toolbox',
}, class HUToolbox extends Gtk.Grid {
    _init(unusedAppId, props = {}) {
        Object.assign(props, {orientation: Gtk.Orientation.VERTICAL});
        super._init(props);

        this._headerbar = new Gtk.HeaderBar({hasSubtitle: false});
        this.add(this._headerbar);

        this._model = new HUModelGlobal();
        this._controlPanel = new HUControlPanel({visible: true});
        this._controlPanel.bindModel(this._model);
        this.add(this._controlPanel);

        this.show_all();
    }

    bindWindow(win) {
        Object.assign(win.frame, {
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.END,
            margin: 100,
        });

        win.get_style_context().add_class('HackUnlock');
        win.lockscreen.locked = false;
        void this;
    }

    shutdown() {
        void this;
    }
});
