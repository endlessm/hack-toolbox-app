/* global pkg, _ */
/* exported main */
// src/main.js
//
// Copyright (c) 2018 Endless Mobile Inc.
//
// This file is the file first run by the entrypoint to the
// hacker-app package.
//
pkg.initGettext();
pkg.initFormat();
pkg.require({
    Gdk: '3.0',
    GdkPixbuf: '2.0',
    Gtk: '3.0',
    Gio: '2.0',
    GLib: '2.0',
    GObject: '2.0',
    Hackable: '0',
    HackToolbox: '0',
});

const {Gdk, GObject, Gio, GLib, Gtk, Hackable, HackToolbox} = imports.gi;

const DATA_RESOURCE_PATH = 'resource:///com/endlessm/HackToolbox';

// Try to get a Hackable Proxy object for the objectPath on
// busName, but if one does not exist, just return null
function maybeGetHackableProxySync(connection, busName, objectPath) {
    try {
        return Hackable.HackableProxy.new_sync(connection,
            Gio.DBusProxyFlags.NONE, busName, objectPath, null);
    } catch (e) {
        logError(e, `${busName}:${objectPath} does not export the Hackable ` +
            'interface, using default toolbox');
        return null;
    }
}

function createHackToolboxSkeletonOnPath(connection, objectPath, targetBusName,
    targetObjectPath) {
    log(`Creating toolbox for ${targetBusName}:${targetObjectPath}`);
    const skeleton = new HackToolbox.ToolboxSkeleton({
        target: new GLib.Variant('(ss)', [targetBusName, targetObjectPath]),
    });
    skeleton.export(connection, objectPath);
    return skeleton;
}

const HackToolboxMainWindow = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/hack-toolbox-main-window.ui`,
    Children: [
        'hack-button',
    ],
    Properties: {
        'hackable-proxy': GObject.ParamSpec.object('hackable-proxy',
            'Hackable Proxy', 'The GDBusInterfaceProxy for the Hackable interface',
            GObject.ParamFlags.READWRITE,
            Hackable.HackableProxy),
        'hack-toolbox-skeleton': GObject.ParamSpec.object('hack-toolbox-skeleton',
            'Hack Toolbox Skeleton', 'The GDBusInterfaceSkeleton for the HackToolbox interface',
            GObject.ParamFlags.READWRITE,
            HackToolbox.ToolboxSkeleton),
        'target-bus-name': GObject.ParamSpec.string('target-bus-name',
            'Target Bus Name', 'The Bus Name that this toolbox is "hacking"',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ''),
        'target-object-path': GObject.ParamSpec.string('target-object-path',
            'Target Object Path', 'The Object Path that this toolbox is "hacking"',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ''),
    },
}, class HackToolboxMainWindow extends Gtk.ApplicationWindow {
    _init(params) {
        super._init(params);

        // Need to create the hack toolbox after the window
        // is created, since we need its id
        const connection = this.application.get_dbus_connection();
        this.hack_toolbox_skeleton = createHackToolboxSkeletonOnPath(connection,
            GLib.build_filenamev([this.application.get_dbus_object_path(),
                'window', String(this.get_id())]),
            this.target_bus_name, this.target_object_path);
        this.hackable_proxy = maybeGetHackableProxySync(connection,
            this.target_bus_name, this.target_object_path);
    }
});

function loadStyleSheet(resourcePath) {
    const provider = new Gtk.CssProvider();
    provider.load_from_resource(resourcePath);
    Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
        provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}

const AUTO_CLOSE_MILLISECONDS_TIMEOUT = 12000;

const HackToolboxApplication = GObject.registerClass(class extends Gtk.Application {
    _init() {
        super._init({
            application_id: pkg.name,
            inactivity_timeout: AUTO_CLOSE_MILLISECONDS_TIMEOUT,
            flags: Gio.ApplicationFlags.IS_SERVICE,
        });
        GLib.set_application_name(_('Hack Toolbox'));

        this._windows = {};

        const showForDBusObject = new Gio.SimpleAction({
            name: 'show-for-dbus-object',
            parameter_type: new GLib.VariantType('(ss)'),
        });
        showForDBusObject.connect('activate', (action, parameterVariant) => {
            const unpacked = parameterVariant.deep_unpack();
            const [busName, objectPath] = unpacked;
            log(`Call showForDBusObject with ${JSON.stringify(unpacked)}`);

            if (!this._windows[busName])
                this._windows[busName] = {};

            if (!this._windows[busName][objectPath]) {
                this._windows[busName][objectPath] = new HackToolboxMainWindow({
                    application: this,
                    target_bus_name: busName,
                    target_object_path: objectPath,
                });
            }

            this._windows[busName][objectPath].present();
        });
        this.add_action(showForDBusObject);
    }

    vfunc_startup() {
        super.vfunc_startup();

        const settings = Gtk.Settings.get_default();
        settings.gtk_application_prefer_dark_theme = true;

        loadStyleSheet('/com/endlessm/HackToolbox/application.css');
    }
});

function main(argv) {
    return (new HackToolboxApplication()).run(argv);
}
