/* exported FrameworkToolbox */

const {GLib, GObject} = imports.gi;

const {Defaults} = imports.framework.defaults;
const Model = imports.framework.model;
const {RaControlPanel} = imports.framework.controlPanel;
const {Toolbox} = imports.toolbox;

var FrameworkToolbox = GObject.registerClass(class FrameworkToolbox extends Toolbox {
    _init(appId, props = {}) {
        this._timeout = null;

        super._init(appId, props);
        this.show_all();
    }

    // See DefaultHackToolbox
    applyChanges(appId, objectPath) {
        this.setBusy(true);
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, 5, () => {
            this.setBusy(false);
            this._timeout = null;
            return GLib.SOURCE_REMOVE;
        });
        return this._model.launch(appId, objectPath);
    }

    bindWindow(win) {
        win.get_style_context().add_class('framework');

        const appId = win.target_app_id;
        const defaults = new Defaults(appId);

        const ModelClass = Model.ensureModelClass(appId, defaults);
        this._model = new ModelClass();
        this.connect('reset', () => this._model.reset());
        this._model.connect('notify::changed', () => {
            win.enableFlipBack = this._model.changed;
        });
        this._model.snapshot();  // ignore any initial syncing

        this._controlPanel = new RaControlPanel(defaults, {visible: true});
        this._controlPanel.bindModel(this._model);
        this._controlPanel.bindWindow(win);
        this.add(this._controlPanel);

        this.setBusy(false);
    }

    // parent class override
    shutdown() {
        if (this._timeout)
            GLib.Source.remove(this._timeout);
    }
});
