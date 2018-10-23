/* exported HackToolboxApplication */
/* global pkg, _ */

const {Gdk, Gio, GLib, GObject, Gtk} = imports.gi;

const {LocksManager} = imports.locksManager;
const {ToolboxWindow} = imports.window;

function _loadStyleSheet(resourcePath) {
    const provider = new Gtk.CssProvider();
    provider.load_from_resource(resourcePath);
    Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
        provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}

function _toolboxClassForBusName(targetBusName) {
    switch (targetBusName) {
    case 'com.endlessm.dinosaurs.en':
        return imports.framework.toolbox.FrameworkToolbox;
    case 'com.endlessm.hackyballs':
        return imports.hackyballs.toolbox.HBToolbox;
    case 'com.endlessm.HackUnlock':
        return imports.HackUnlock.toolbox.HUToolbox;
    case 'com.endlessm.OperatingSystemApp':
        return imports.OperatingSystemApp.toolbox.OSToolbox;
    default:
        return imports.hacktoolbox.hacktoolbox.DefaultHackToolbox;
    }
}

function _shouldUseDarkTheme(targetBusName) {
    switch (targetBusName) {
    case 'com.endlessm.dinosaurs.en':
    case 'com.endlessm.hackyballs':
    case 'com.endlessm.HackUnlock':
    case 'com.endlessm.OperatingSystemApp':
        return false;
    default:
        return true;
    }
}

const AUTO_CLOSE_MILLISECONDS_TIMEOUT = 12000;

var HackToolboxApplication = GObject.registerClass(class extends Gtk.Application {
    _init() {
        super._init({
            application_id: pkg.name,
            inactivity_timeout: AUTO_CLOSE_MILLISECONDS_TIMEOUT,
            flags: Gio.ApplicationFlags.IS_SERVICE,
        });
        GLib.set_application_name(_('Hack Toolbox'));

        this._windows = {};

        const flip = new Gio.SimpleAction({
            name: 'flip',
            parameter_type: new GLib.VariantType('(ss)'),
        });
        flip.connect('activate', this._onFlip.bind(this));
        this.add_action(flip);
    }

    vfunc_startup() {
        super.vfunc_startup();

        _loadStyleSheet('/com/endlessm/HackToolbox/application.css');

        const iconTheme = Gtk.IconTheme.get_default();
        iconTheme.add_resource_path('/com/endlessm/HackToolbox/framework/icons');

        this.set_accels_for_action('win.unlock-cheat', ['<control><shift>R']);

        this._locksManager = new LocksManager();
    }

    _onFlip(action, parameterVariant) {
        this.hold();
        const unpacked = parameterVariant.deep_unpack();
        const [busName, objectPath] = unpacked;
        log(`Call flip with ${JSON.stringify(unpacked)}`);

        if (!this._windows[busName])
            this._windows[busName] = {};

        if (!this._windows[busName][objectPath]) {
            const ToolboxClass = _toolboxClassForBusName(busName);
            const toolbox = new ToolboxClass({visible: true});
            const win = new ToolboxWindow({
                application: this,
                target_bus_name: busName,
                target_object_path: objectPath,
            });
            win.add(toolbox);
            toolbox.bindWindow(win);

            const settings = Gtk.Settings.get_default();
            const darkTheme = _shouldUseDarkTheme(busName);
            settings.gtk_application_prefer_dark_theme = darkTheme;

            this._windows[busName][objectPath] = win;
            win.connect('destroy', () => {
                delete this._windows[busName][objectPath];
            });
        }

        this._windows[busName][objectPath].present();
        this.release();
    }

    get locksManager() {
        return this._locksManager;
    }
});
