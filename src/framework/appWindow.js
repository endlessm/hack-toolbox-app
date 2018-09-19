/* exported RaAppWindow */

const {GObject} = imports.gi;

const {RaControlPanel} = imports.framework.controlPanel;
const {RaModel} = imports.framework.model;
const {ToolboxWindowBase} = imports.window;

var RaAppWindow = GObject.registerClass(class RaAppWindow extends ToolboxWindowBase {
    _init(props = {}) {
        super._init(props);
        this.show_all();

        this._controlPanel = new RaControlPanel();
        this.borderWidth = 20;

        this.add(this._controlPanel);

        this._model = new RaModel();

        this._controlPanel.bindModel(this._model);
    }
});
