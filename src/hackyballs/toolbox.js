/* exported HBToolbox */

const {GObject} = imports.gi;

const {Toolbox} = imports.toolbox;
const {HBControlPanel} = imports.hackyballs.controlpanel;
const {HBModelGlobal} = imports.hackyballs.model;

var HBToolbox = GObject.registerClass(class HBToolbox extends Toolbox {
    _init(props = {}) {
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
        this._controlPanel.bindWindow(win);
    }
});
