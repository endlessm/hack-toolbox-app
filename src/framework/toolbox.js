/* exported FrameworkToolbox */

const {GObject} = imports.gi;

const {RaControlPanel} = imports.framework.controlPanel;
const {RaModel} = imports.framework.model;
const {Toolbox} = imports.toolbox;

var FrameworkToolbox = GObject.registerClass(class FrameworkToolbox extends Toolbox {
    _init(props = {}) {
        super._init(props);
        this.show_all();

        this._controlPanel = new RaControlPanel({visible: true});
        this.add(this._controlPanel);

        this._model = new RaModel();

        this._controlPanel.bindModel(this._model);
    }

    // See DefaultHackToolbox
    applyChanges(busName, objectPath) {
        return this._model.launch(busName, objectPath);
    }

    bindWindow(win) {
        this._controlPanel.bindWindow(win);
    }
});
