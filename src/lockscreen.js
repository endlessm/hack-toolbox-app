/* exported Lockscreen */
/* global pkg */

const {Gio, GLib, GObject, Gtk} = imports.gi;

const {Playbin} = imports.playbin;
const SoundServer = imports.soundServer;

var Lockscreen = GObject.registerClass({
    GTypeName: 'Lockscreen',
    CssName: 'lockscreen',
    Properties: {
        locked: GObject.ParamSpec.boolean('locked', 'Locked', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            true),
        key: GObject.ParamSpec.string('key', 'Key', '',
            GObject.ParamFlags.READWRITE, ''),
        lock: GObject.ParamSpec.string('lock', 'lock', '',
            GObject.ParamFlags.READWRITE, ''),
    },
}, class Lockscreen extends Gtk.Overlay {
    _init(props = {}) {
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
        this._activeSoundID = null;
        this._updateUI();

        this._playbin.connect('realize', () => {
            this._playActiveSound();
        });
        this.connect('destroy', () => {
            this._stopActiveSound();
        });
    }

    get locked() {
        return this._locked;
    }

    set locked(value) {
        if ('_locked' in this && this._locked === value)
            return;
        this._locked = value;
        this._updateUI();
        this.notify('locked');
    }

    get key() {
        return this._key;
    }

    set key(key) {
        if ('_key' in this && this._key === key)
            return;
        if (this._keyChangedId !== 0)
            this._manager.disconnect(this._keyChangedId);
        this._keyChangedId = this._manager.connect(
            `changed::${key}`, () => {
                this._updateLockStateWithKey();
                this._playActiveSound();
            });
        this._key = key;
        this._updateLockStateWithKey();
    }

    get lock() {
        return this._lock;
    }

    set lock(lock) {
        if ('_lock' in this && this._lock === lock)
            return;
        if (this._lockChangedId !== 0)
            this._manager.disconnect(this._lockChangedId);
        this._lockChangedId = this._manager.connect(
            `changed::${lock}`, this._updateLockStateWithLock.bind(this));
        this._lock = lock;
        this._updateLockStateWithLock();
    }

    _updateBackground () {
        const defaultPath = GLib.build_filenamev([pkg.pkgdatadir, 'lockscreens', 'default']);
        var assetsHasKey = false;
        var assetsPath;
        var videoPath;

        if (this._lock) {
            const path = GLib.build_filenamev([pkg.pkgdatadir, 'lockscreens', this._lock]);
            const dir = Gio.File.new_for_path(path);

            if (dir.query_exists(null) &&
                dir.get_child('no-key').query_exists(null)) {
                // All the required assets are here, let's use this path for
                // the background
                assetsPath = path;

                // Now check the optional assets
                assetsHasKey = dir.get_child('has-key').query_exists(null);

                if (dir.get_child('open.webm').query_exists(null))
                    videoPath = assetsPath;
            }
        } else {
            videoPath = defaultPath;
        }

        if (!assetsPath)
            assetsPath = defaultPath;

        if (videoPath)
            this._openURI = `file://${videoPath}/open.webm`;
        else
            this._openURI = null;

        this._playbin.hasKey = this._key && this._manager.hasKey(this._key);

        if (assetsHasKey && this._playbin.hasKey)
            this._playbin.background = `file://${assetsPath}/has-key`;
        else
            this._playbin.background = `file://${assetsPath}/no-key`;
    }

    _updateLockStateWithKey() {
        if (!this._key)
            return;
        this._updateBackground();
    }

    _playActiveSound() {
        if (!this._locked)
            return;
        if (!this._playbin.hasKey)
            return;

        /* if waiting for the loop to start, leave it */
        if (this._activeSoundID === 'pending')
            return;

        /* if the loop is playing, leave it */
        if (this._activeSoundID !== null && this._activeSoundID !== 'cancel')
            return;

        SoundServer.getDefault().playAsync('hack-toolbox/lockscreen/active')
        .then(uuid => {
            if (this._activeSoundID === 'cancel') {
                this._activeSoundID = uuid;
                this._stopActiveSound();
                return;
            }
            this._activeSoundID = uuid;
        });
        this._activeSoundID = 'pending';
    }

    _stopActiveSound() {
        if (this._activeSoundID === null)
            return;
        if (this._activeSoundID === 'cancel')
            return;
        if (this._activeSoundID === 'pending') {
            this._activeSoundID = 'cancel';
            return;
        }
        SoundServer.getDefault().stop(this._activeSoundID);
        this._activeSoundID = null;
    }

    _updateLockStateWithLock() {
        this._playbin.hasLock = !!this._lock;

        if (!this._lock)
            return;

        this._updateBackground();

        if (!this._manager.isUnlocked(this._lock))
            return;
        this.locked = false;
    }

    _onClicked() {
        if (!this.locked)
            return;

        this._stopActiveSound();

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
        if (!this._playbin)
            return;

        this._playbin.hasLock = !!this._lock;

        if (this._locked) {
            this._playbin.show();
        } else if (this._playbin.uri) {
            this._playbin.show();
            this._playbin.play();
        } else {
            this._playbin.hide();
        }
    }
});
