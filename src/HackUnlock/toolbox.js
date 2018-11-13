/* exported HUToolbox */

const {GObject, Gtk} = imports.gi;
const Gettext = imports.gettext;

const {Toolbox} = imports.toolbox;
const {HUControlPanel} = imports.HackUnlock.controlpanel;
const {HUModelGlobal} = imports.HackUnlock.model;

const _ = Gettext.gettext;

var HUToolbox = GObject.registerClass(class HUToolbox extends Toolbox {
    _init(props = {}) {
        props.title = _('Controls');
        super._init(props);
        this._model = new HUModelGlobal();
        this._controlPanel = new HUControlPanel({visible: true});
        this._controlPanel.bindModel(this._model);
        this.add(this._controlPanel);
        this.show_all();

        this.connect('reset', () => {
            this._model.reset();
        });
    }

    bindWindow(win) {
        Object.assign(win.frame, {
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.END,
            margin: 0,
        });

        win.get_style_context().add_class('HackUnlock');
        win.lockscreen.locked = false;
        void this;
    }
});
