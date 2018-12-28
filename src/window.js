/* exported ToolboxWindow */

const {Gio, GLib, GObject, Gtk, HackToolbox} = imports.gi;
const {Lockscreen} = imports.lockscreen;

var ToolboxWindow = GObject.registerClass({
    Properties: {
        'target-app-id': GObject.ParamSpec.string('target-app-id',
            'Target App ID', 'The App ID that this toolbox is "hacking"',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ''),
        'target-window-id': GObject.ParamSpec.string('target-window-id',
            'Target Window ID', 'The Window ID that this toolbox is "hacking"',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ''),
    },
}, class ToolboxWindow extends Gtk.ApplicationWindow {
    _init(toolbox, params) {
        Object.assign(params, {expand: true});
        super._init(params);

        this._toolbox = toolbox;
        // Need to create the hack toolbox after the window
        // is created, since we need its id
        const objectPath =
            `${this.application.get_dbus_object_path()}/window/${this.get_id()}`;
        this.hack_toolbox_skeleton = this._createHackToolboxSkeletonOnPath(objectPath);

        this._flipBack = new Gio.SimpleAction({
            name: 'flip-back',
        });
        this._flipBack.connect('activate', this._onFlipBack.bind(this));
        this.enableFlipBack = false;

        const screen = this.get_screen();
        this.set_visual(screen.get_rgba_visual());

        this._lockscreen = new Lockscreen({
            toolbox: this._toolbox,
            expand: true,
            visible: true,
        });

        this._toolbox_frame = new Gtk.Frame({
            halign: Gtk.Align.END,
            valign: Gtk.Align.END,
            marginEnd: 50,
            visible: true,
        });
        this._toolbox_frame.get_style_context().add_class('toolbox');

        Gtk.Container.prototype.add.call(this, this._lockscreen);
        this._lockscreen.add(this._toolbox_frame);

        const context = this.get_style_context();
        context.add_class('toolbox-surrounding-window');

        this.connect('destroy', () => {
            if (this._toolbox)
                this._toolbox.shutdown();
        });
        this._toolbox_frame.add(this._toolbox);
    }

    _onFlipBack() {
        log(`Call flip-back for ${this.target_app_id}, ${this.target_window_id}`);

        this.toolbox.applyChanges(this.target_app_id, this.target_window_id)
        .catch(e => {
            logError(e);
        });
    }

    get frame() {
        return this._toolbox_frame;
    }

    get lockscreen() {
        return this._lockscreen;
    }

    get toolbox() {
        return this._toolbox;
    }

    set enableFlipBack(val) {
        if (val) {
            this.add_action(this._flipBack);
            this.get_style_context().add_class('has-changes');
        } else {
            this.remove_action('flip-back');
            this.get_style_context().remove_class('has-changes');
        }
    }

    _createHackToolboxSkeletonOnPath(objectPath) {
        log(`Creating toolbox for ${this.target_app_id}:${this.target_window_id}`);
        const skeleton = new HackToolbox.ToolboxSkeleton({
            target: new GLib.Variant('(ss)', [this.target_app_id, this.target_window_id]),
        });
        skeleton.export(this.application.get_dbus_connection(), objectPath);
        return skeleton;
    }
});
