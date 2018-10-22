/* exported HBToolbox */

const {GObject} = imports.gi;
const Gettext = imports.gettext;

const {Toolbox} = imports.toolbox;
const {HBControlPanel} = imports.hackyballs.controlpanel;
const {HBModelGlobal} = imports.hackyballs.model;

const _ = Gettext.gettext;

var HBToolbox = GObject.registerClass(class HBToolbox extends Toolbox {
    _init(props = {}) {
        props.title = _('Hack Modules');
        super._init(props);
        this._model = new HBModelGlobal();
        this._controlPanel = new HBControlPanel({visible: true});
        this._controlPanel.bindModel(this._model);
        this.add(this._controlPanel);
        this.show_all();

        this.connect('reset', () => {
            this._model.reset();
        });
    }

    bindWindow(win) {
        win.get_style_context().add_class('hackyballs');
        this._controlPanel.bindWindow(win);
    }
});
