/* exported RaControlPanel */

const {GObject, Gtk} = imports.gi;

const {FrameworkLevel1} = imports.framework.level1;
const {FrameworkLevel2} = imports.framework.level2;
const {FrameworkLevel3} = imports.framework.level3;
const {Lockscreen} = imports.lockscreen;

var RaControlPanel = GObject.registerClass(class RaControlPanel extends Gtk.Grid {
    _init(defaults, props = {}) {
        Object.assign(props, {
            borderWidth: 24,
            rowSpacing: 24,
            columnSpacing: 24,
        });
        super._init(props);

        this._level1 = new FrameworkLevel1(defaults, {visible: true});
        this.attach(this._level1, 0, 0, 1, 1);

        this._level2lock = new Lockscreen({
            hexpand: true,
            valign: Gtk.Align.START,
            visible: true,
        });
        this._level2 = new FrameworkLevel2({visible: true, hexpand: true});
        this._level2lock.add(this._level2);
        this.attach(this._level2lock, 0, 1, 1, 1);

        this._level3lock = new Lockscreen({
            valign: Gtk.Align.START,
            visible: false,
        });
        this._level3 = new FrameworkLevel3(defaults, {visible: true});
        this._level3lock.add(this._level3);
        this.attach(this._level3lock, 1, 0, 1, 2);

        [this._key1, this._key2, this._key3] = defaults.keys;
        [this._lock1, this._lock2, this._lock3] = defaults.locks;

        this._level3lock.bind_property('locked',
            this._level3, 'update-sound-enabled',
            GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.INVERT_BOOLEAN);
    }

    bindModel(model) {
        this._level1.bindModel(model);
        this._level2.bindModel(model);
        this._level3.bindModel(model);
    }

    bindWindow(win) {
        this._level2lock.connect('notify::locked', () => {
            if (!this._level2lock.locked)
                this._level3lock.show_all();
        });

        win.lockscreen.key = this._key1;
        win.lockscreen.lock = this._lock1;
        this._level2lock.key = this._key2;
        this._level2lock.lock = this._lock2;
        this._level3lock.key = this._key3;
        this._level3lock.lock = this._lock3;
    }
});
