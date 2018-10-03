/* exported ToolboxWindow */

const {Gio, GLib, GObject, Gtk, Hackable, HackToolbox} = imports.gi;

function _shouldEnableFlipBack(targetBusName) {
    switch (targetBusName) {
    case 'com.endlessm.dinosaurs.en':
        return true;
    default:
        return false;
    }
}

var ToolboxWindow = GObject.registerClass({
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
}, class ToolboxWindow extends Gtk.ApplicationWindow {
    _init(params) {
        Object.assign(params, {expand: true});
        super._init(params);

        // Need to create the hack toolbox after the window
        // is created, since we need its id
        const objectPath =
            `${this.application.get_dbus_object_path()}/window/${this.get_id()}`;
        this.hack_toolbox_skeleton = this._createHackToolboxSkeletonOnPath(objectPath);
        this.hackable_proxy = this._maybeGetHackableProxySync();

        this._flipBack = new Gio.SimpleAction({
            name: 'flip-back',
        });
        this._flipBack.connect('activate', this._onFlipBack.bind(this));
        this.enableFlipBack = _shouldEnableFlipBack(this.target_bus_name);

        const screen = this.get_screen();
        this.set_visual(screen.get_rgba_visual());

        this._toolbox_frame = new Gtk.Frame({
            halign: Gtk.Align.END,
            valign: Gtk.Align.END,
            marginEnd: 50,
            visible: true,
        });
        this._toolbox_frame.get_style_context().add_class('toolbox');
        Gtk.Container.prototype.add.call(this, this._toolbox_frame);

        this.get_style_context().add_class('toolbox-surrounding-window');
    }

    _onFlipBack() {
        log(`Call flip-back for ${this.target_bus_name}, ${this.target_object_path}`);

        this.toolbox.applyChanges(this.target_bus_name, this.target_object_path)
        .catch(e => {
            logError(e);
        });
    }

    // Override Gtk.Container.add()
    add(widget) {
        this._toolbox = widget;
        this._toolbox_frame.add(widget);
    }

    get toolbox() {
        return this._toolbox;
    }

    set enableFlipBack(val) {
        if (val)
            this.add_action(this._flipBack);
        else
            this.remove_action('flip-back');
    }

    _createHackToolboxSkeletonOnPath(objectPath) {
        log(`Creating toolbox for ${this.target_bus_name}:${this.target_object_path}`);
        const skeleton = new HackToolbox.ToolboxSkeleton({
            target: new GLib.Variant('(ss)', [this.target_bus_name, this.target_object_path]),
        });
        skeleton.export(this.application.get_dbus_connection(), objectPath);
        return skeleton;
    }

    // Try to get a Hackable Proxy object for the objectPath on
    // busName, but if one does not exist, just return null
    _maybeGetHackableProxySync() {
        try {
            return Hackable.HackableProxy.new_sync(this.application.get_dbus_connection(),
                Gio.DBusProxyFlags.NONE, this.target_bus_name,
                this.target_object_path, null);
        } catch (e) {
            logError(e, `${this.target_bus_name}:${this.target_object_path} does ` +
                'not export the Hackable interface, using default toolbox');
            return null;
        }
    }
});
