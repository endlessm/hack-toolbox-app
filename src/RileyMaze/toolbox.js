/* exported RMZToolbox */

const {Gio, GLib, GObject, Gtk} = imports.gi;

const {RMZUnitsTopic} = imports.RileyMaze.RMZUnit;
const {RMZGlobalModel} = imports.RileyMaze.globalParams;
const {RMZUserFunction} = imports.RileyMaze.userFunction;
const {Toolbox} = imports.toolbox;

var RMZToolbox = GObject.registerClass(class RMZToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);

        const iconTheme = Gtk.IconTheme.get_default();
        iconTheme.add_resource_path('/com/endlessm/HackToolbox/RileyMaze/icons');

        this._global = new RMZGlobalModel();
        this._instructTopic = new RMZUserFunction('instructions');
        this._instructTopic.bindGlobalModel(this._global);
        this.addTopic('instructions', 'Instructions', 'spawn-symbolic',
            this._instructTopic);
        this.showTopic('instructions');

        this._unitTopic = new RMZUnitsTopic();
        this._unitTopic.bindGlobalModel(this._global);
        this.addTopic('unit', 'Unit', 'powerup-symbolic',
            this._unitTopic);
        this.showTopic('unit');
        // this.hideTopic('unit');

        this._levelTopic = new RMZUserFunction('level');
        this._levelTopic.bindGlobalModel(this._global);
        this.addTopic('level', 'Level', 'spawn-symbolic',
            this._levelTopic);
        this.showTopic('level');

        this.revealTopic('instructions'); // Hacky until there's an app
        this.revealTopic('level');

        this._updateLevelInfo();
        this.show_all();

        this._updateLevelHandler = this._global.connect('notify::currentLevel',
            this._updateLevelInfo.bind(this));
        this.connect('reset', this._onReset.bind(this));
    }

    bindWindow(win) {
        win.get_style_context().add_class('RileyMaze');
        this._unitTopic.bindWindow(win);
        win.lockscreen.key = 'item.key.Sidetrack.1';
        win.lockscreen.lock = 'lock.Sidetrack.1';
    }

    _updateLevelInfo() {
        let text = `Level ${this._global.currentLevel}`;
        if (this._global.currentLevel === 0)
            text = 'Intro';
        this.setInfo(text);
    }

    _onReset() {
        Gio.DBus.session.call_sync('com.endlessm.Sidetrack',
            '/com/endlessm/Sidetrack', 'org.gtk.Actions', 'Activate',
            new GLib.Variant('(sava{sv})', ['reset', [], {}]),
            null, Gio.DBusCallFlags.NONE, -1, null);
        this._unitTopic.reset();
    }

    _onGameStateChanged(self, senderName, [key, value]) {
        if (!key.startsWith('sidetrack.topic.'))
            return;
        const topic = key.slice('sidetrack.topic.'.length);
        let {visible} = value.deep_unpack();
        if (visible instanceof GLib.Variant)
            visible = visible.deep_unpack();
        if (visible)
            this.revealTopic(topic);
        else
            this.hideTopic(topic);
        // Just set to visible till we have a gamestate
        this.revealTopic(topic);
    }

    shutdown() {
        super.shutdown();

        if (this._global && this._updateLevelHandler) {
            this._global.disconnect(this._updateLevelHandler);
            this._global = null;
            this._updateLevelHandler = null;
        }

        this._instructTopic.unbindGlobalModel();
    }
});

