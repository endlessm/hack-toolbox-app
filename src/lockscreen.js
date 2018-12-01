/* exported Lockscreen */

const {Gio, GObject, Gtk} = imports.gi;

const {Playbin} = imports.playbin;

var Lockscreen = GObject.registerClass({
    GTypeName: 'Lockscreen',
    CssName: 'lockscreen',
    Properties: {
        locked: GObject.ParamSpec.boolean('locked', 'Locked', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            true),
        key: GObject.ParamSpec.string('key', 'Key', '',
            GObject.ParamFlags.READWRITE, null),
        lock: GObject.ParamSpec.string('lock', 'lock', '',
            GObject.ParamFlags.READWRITE, null),
    },
}, class Lockscreen extends Gtk.Overlay {
    _init(props = {}) {
        this._locked = true;
        this._key = null;
        this._lock = null;

        super._init(props);

        this._playbin = new Playbin({
            expand: true,
            noShowAll: true,
        });

        this._playbin.connect('clicked', this._onClicked.bind(this));

        this._playbin.connect('done', () => {
            this._playbin.hide();
        });

        this.add_overlay(this._playbin);

        this._manager = Gio.Application.get_default().locksManager;
        this._keyChangedId = 0;
        this._lockChangedId = 0;
        this._updateUI();
    }

    get locked() {
        return this._locked;
    }

    set locked(value) {
        if (this._locked === value)
            return;
        this._locked = value;
        this._updateUI();
        this.notify('locked');
    }

    get key() {
        return this._key;
    }

    set key(key) {
        if (this._key === key)
            return;
        if (this._keyChangedId !== 0)
            this._manager.disconnect(this._keyChangedId);
        this._keyChangedId = this._manager.connect(
            `changed::${key}`, this._updateLockStateWithKey.bind(this));
        this._key = key;
        this._updateLockStateWithKey();
    }

    get lock() {
        return this._lock;
    }

    set lock(lock) {
        if (this._lock === lock)
            return;
        if (this._lockChangedId !== 0)
            this._manager.disconnect(this._lockChangedId);
        this._lockChangedId = this._manager.connect(
            `changed::${lock}`, this._updateLockStateWithLock.bind(this));
        this._lock = lock;
        this._updateLockStateWithLock();
    }

    _updateBackground () {
        var assetsPath = '/app/share/lockscreens/default';
        var assetsOpen = true;
        var assetsHasKey = false;

        this._openURI = null;

        if (this._lock) {
            var path = `/app/share/lockscreens/${this._lock}`;
            var dir = Gio.File.new_for_path(path);
            var no_key = dir.get_child('no-key');

            if (dir.query_exists(null) && no_key.query_exists(null)) {
                assetsHasKey = dir.get_child('has-key').query_exists(null);
                assetsOpen = dir.get_child('open.webm').query_exists(null);
                assetsPath = path;

                if (dir.get_child('open.webm').query_exists(null))
                    this._openURI = `file://${assetsPath}/open.webm`;
            }
        } else {
            this._openURI = `file://${assetsPath}/open.webm`;
        }

        if (assetsHasKey && this._key && this._manager.hasKey(this._key))
            this._playbin.setBackground(`file://${assetsPath}/has-key`);
        else
            this._playbin.setBackground(`file://${assetsPath}/no-key`);
    }

    _updateLockStateWithKey() {
        if (!this._key)
            return;
        this._updateBackground();
    }

    _updateLockStateWithLock() {
        let playbinStyle = this._playbin.get_style_context();

        if (!this._lock) {
            playbinStyle.add_class('no-lock');
            return;
        }

        playbinStyle.remove_class('no-lock');
        this._updateBackground();

        if (!this._manager.isUnlocked(this._lock))
            return;
        this.locked = false;
    }

    _onClicked() {
        if (!this.locked)
            return;

        if (this._manager.hasKey('item.key.master')) {
            this.locked = false;
            return;
        }
        if (!this._key || !this._lock)
            return;
        if (!this._manager.hasKey(this._key))
            return;

        /* We are going to need to playback an animation */
        if (this._openURI)
            this._playbin.uri = this._openURI;

        this._manager.setUnlocked(this._lock);
        this._manager.setUsed(this._key);
    }

    _updateUI() {
        let playbinStyle = this._playbin.get_style_context();

        if (this._lock)
            playbinStyle.remove_class('no-lock');
        else
            playbinStyle.add_class('no-lock');

        this._playbin.locked = this._locked;

        if (this._locked) {
            this._playbin.show();
        } else if (this._openURI) {
            this._playbin.show();
            this._playbin.play();
        } else {
            this._playbin.hide();
        }
    }
});
