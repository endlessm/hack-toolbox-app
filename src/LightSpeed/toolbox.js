/* exported LSToolbox */

const {Gio, GLib, GObject} = imports.gi;

const {Toolbox} = imports.toolbox;
const {LSControlPanel} = imports.LightSpeed.controlpanel;
const {LSGlobalModel} = imports.LightSpeed.globalParams;

var LSToolbox = GObject.registerClass(class LSToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);
        this._global = new LSGlobalModel();
        this._controlPanel = new LSControlPanel({visible: true});
        this._controlPanel.bindGlobal(this._global);
        this.add(this._controlPanel);
        this.show_all();

        this.connect('reset', this._onReset.bind(this));
    }

    bindWindow(win) {
        win.get_style_context().add_class('LightSpeed');
        this._controlPanel.bindWindow(win);
    }

    _onReset() {
        Gio.DBus.session.call_sync('com.endlessm.LightSpeed',
            '/com/endlessm/LightSpeed', 'org.gtk.Actions', 'Activate',
            new GLib.Variant('(sava{sv})', ['reset', [], {}]),
            null, Gio.DBusCallFlags.NONE, -1, null);
        this._controlPanel.reset();
    }
});
