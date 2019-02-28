/* exported LSToolbox */

const {Gio, GLib, GObject, Gtk} = imports.gi;

const {Toolbox} = imports.toolbox;
const {LSControlPanel} = imports.LightSpeed.controlpanel;
const {LSGlobalModel} = imports.LightSpeed.globalParams;

var LSToolbox = GObject.registerClass(class LSToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);

        const iconTheme = Gtk.IconTheme.get_default();
        iconTheme.add_resource_path('/com/endlessm/HackToolbox/LightSpeed/icons');

        this._global = new LSGlobalModel();
        this._controlPanel = new LSControlPanel({visible: true});
        this._controlPanel.bindGlobal(this._global);
        this.addTopic('Tools', 'preferences-other-symbolic', this._controlPanel);
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
