/* exported HUToolbox */

const {GObject, Gtk} = imports.gi;

const {Toolbox} = imports.toolbox;
const {HUControlPanel} = imports.HackUnlock.controlpanel;
const {HUModelGlobal} = imports.HackUnlock.model;

var HUToolbox = GObject.registerClass(class HUToolbox extends Toolbox {
    _init(props = {}) {
        props.title = '';
        super._init(props);
        this._model = new HUModelGlobal();
        this._controlPanel = new HUControlPanel({visible: true});
        this._controlPanel.bindModel(this._model);
        this.add(this._controlPanel);
        this.show_all();

        this.buttonReset.visible = false;
        this.buttonMinimize.visible = false;
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
});
