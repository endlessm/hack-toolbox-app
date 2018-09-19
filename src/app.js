/* exported HackToolboxApplication */
/* global pkg, _ */

const {Gdk, Gio, GLib, GObject, Gtk} = imports.gi;

function _loadStyleSheet(resourcePath) {
    const provider = new Gtk.CssProvider();
    provider.load_from_resource(resourcePath);
    Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
        provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}

function _windowClassForBusName(targetBusName) {
    switch (targetBusName) {
    default:
        return imports.hacktoolbox.hacktoolbox.HackToolboxMainWindow;
    }
}

function _shouldUseDarkTheme(targetBusName) {
    switch (targetBusName) {
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
    }

    _onFlip(action, parameterVariant) {
        const unpacked = parameterVariant.deep_unpack();
        const [busName, objectPath] = unpacked;
        log(`Call flip with ${JSON.stringify(unpacked)}`);

        if (!this._windows[busName])
            this._windows[busName] = {};

        if (!this._windows[busName][objectPath]) {
            const WindowClass = _windowClassForBusName(busName);
            this._windows[busName][objectPath] = new WindowClass({
                application: this,
                target_bus_name: busName,
                target_object_path: objectPath,
            });

            const settings = Gtk.Settings.get_default();
            const darkTheme = _shouldUseDarkTheme(busName);
            settings.gtk_application_prefer_dark_theme = darkTheme;
        }

        this._windows[busName][objectPath].present();
    }
});
