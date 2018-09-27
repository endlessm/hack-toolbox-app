/* exported ToolboxWindowBase */

const {Gio, GLib, GObject, Gtk, Hackable, HackToolbox} = imports.gi;

var ToolboxWindowBase = GObject.registerClass({
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
}, class ToolboxWindowBase extends Gtk.ApplicationWindow {
    _init(params) {
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
    }

    _onFlipBack(action, parameterVariant) {
        log(`Call flip-back for ${this.target_bus_name}, ${this.target_object_path}`);

        this.applyChanges()
        .catch(e => {
            logError(e);
        });
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

    // Intended to be overridden by subclasses, if they need to implement any
    // behaviour before flipping back to the app
    applyChanges() {
        void this;
        return Promise.resolve();
    }
});
