/* exported FrameworkToolbox */

const {GLib, GObject} = imports.gi;
const Gettext = imports.gettext;

const {RaControlPanel} = imports.framework.controlPanel;
const {RaModel} = imports.framework.model;
const {Toolbox} = imports.toolbox;

const _ = Gettext.gettext;

var FrameworkToolbox = GObject.registerClass(class FrameworkToolbox extends Toolbox {
    _init(props = {}) {
        this._timeout = null;

        props.title = _('Hack Modules');
        super._init(props);
        this.show_all();

        this._controlPanel = new RaControlPanel({visible: true});
        this.add(this._controlPanel);

        this._model = new RaModel();
        this.connect('reset', () => this._model.reset());

        this._controlPanel.bindModel(this._model);

        this._unlockState = [false, false, false];
        this.setBusy(false);

        this._model.snapshot();  // ignore any initial syncing
    }

    // See DefaultHackToolbox
    applyChanges(busName, objectPath) {
        this.setBusy(true);
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, 5, () => {
            this.setBusy(false);
            this._timeout = null;
            return GLib.SOURCE_REMOVE;
        });
        return this._model.launch(busName, objectPath);
    }

    bindWindow(win) {
        win.get_style_context().add_class('framework');
        this._controlPanel.bindWindow(win);
        this._model.connect('notify::changed', () => {
            win.enableFlipBack = this._model.changed;
        });
    }

    // parent class override
    shutdown() {
        if (this._timeout)
            GLib.Source.remove(this._timeout);
    }
});
