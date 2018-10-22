/* exported HUToolbox */

const {GObject} = imports.gi;
const Gettext = imports.gettext;

const {Toolbox} = imports.toolbox;
const {HUControlPanel} = imports.HackUnlock.controlpanel;
const {HUModelGlobal} = imports.HackUnlock.model;

const _ = Gettext.gettext;

var HUToolbox = GObject.registerClass(class HUToolbox extends Toolbox {
    _init(props = {}) {
        props.title = _('Hack Modules');
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
        win.get_style_context().add_class('HackUnlock');
        win.lockscreen.locked = false;
        this._win = win;
    }
});
