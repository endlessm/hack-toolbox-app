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
            this._unitTopic, true);
        this.showTopic('unit');
        this.addTopicKeys('unit', 'item.key.Sidetrack.2', 'lock.Sidetrack.2');

        this._levelTopic = new RMZUserFunction('level');
        this._levelTopic.bindGlobalModel(this._global);
        this.addTopic('level', 'Level', 'spawn-symbolic',
            this._levelTopic, true);
        this.addTopicKeys('level', 'item.key.Sidetrack.3', 'lock.Sidetrack.3');
        this.showTopic('level');

        this._updateLevelInfo();
        this.show_all();

        this._updateLevelHandler = this._global.connect('notify::currentLevel',
            this._updateLevelInfo.bind(this));
        this.connect('reset', this._onReset.bind(this));
    }

    bindWindow(win) {
        win.get_style_context().add_class('RileyMaze');
        win.lockscreen.key = 'item.key.Sidetrack.1';
        win.lockscreen.lock = 'lock.Sidetrack.1';
        this._unitTopic.bindWindow(win);
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

