/* exported HackToolboxMainWindow */
const {Gio, GLib, GObject, Gtk, Hackable, HackToolbox} = imports.gi;

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

var HackToolboxMainWindow = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/hack-toolbox-main-window.ui`,
    Children: [
        'hack-button',
    ],
    Properties: {
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
