/* exported FizzicsToolbox */

const {GObject} = imports.gi;
const Gettext = imports.gettext;

const {Toolbox} = imports.toolbox;
const {FizzicsControlPanel} = imports.Fizzics.controlpanel;
const {FizzicsModelGlobal} = imports.Fizzics.model;

const _ = Gettext.gettext;

var FizzicsToolbox = GObject.registerClass(class FizzicsToolbox extends Toolbox {
    _init(props = {}) {
        props.title = _('Hack Modules');
        super._init(props);
        this._model = new FizzicsModelGlobal();
        this._controlPanel = new FizzicsControlPanel({visible: true});
        this._controlPanel.bindModel(this._model);
        this.add(this._controlPanel);
        this.show_all();

        this.connect('reset', () => {
            this._model.reset();
        });
    }

    bindWindow(win) {
        win.get_style_context().add_class('Fizzics');
        this._controlPanel.bindWindow(win);
    }
});
