/* exported WobblyLockscreen */
/* global pkg */

const {GLib, GObject} = imports.gi;

const {Lockscreen} = imports.lockscreen;

var WobblyLockscreen = GObject.registerClass({
    GTypeName: 'WobblyLockscreen',
    CssName: 'wobblylockscreen',
}, class WobblyLockscreen extends Lockscreen {
    _init(props = {}) {
        super._init(props, false);
        this._timeout = null;
        this.connect('destroy', () => {
            if (this._timeout) {
                this._manager.setLockTried(this.lock, false);
                GLib.Source.remove(this._timeout);
            }
        });
    }

    _updateBackground() {
        super._updateBackground();
        const assetsPath = this.getAssetsPath();
        const trapSequence = this._manager.getTrapSequence(this.lock);
        log(`MANUQ _updateBackground ${trapSequence}`);
        if (trapSequence === 0) {
            const defaultPath = GLib.build_filenamev([pkg.pkgdatadir, 'lockscreens', 'default']);
            this._playbin.background = `file://${assetsPath}/trap0`;
            this._playbin.uri = `file://${defaultPath}/open.webm`;
            this._playbin._destroy_after_play = false;
            this._playbin.play();
        }
        if (trapSequence === 1)
            this._playbin.background = `file://${assetsPath}/trap1`;
        if (trapSequence === 2) {
            this._playbin._destroy_after_play = true;
            this._playbin.background = `file://${assetsPath}/trap2`;
        }
    }

    _updateLockStateWithLock() {
        log(`MANUQ _updateLockStateWithLock`);
        super._updateLockStateWithLock();
    }

    _onClicked() {
        if (!this.locked)
            return;

        if (this._manager.hasKey('item.key.master')) {
            this.locked = false;
            return;
        }

        if (this._key === 'item.key.OperatingSystemApp.2') {
            this._manager.setLockTried(this.lock, true);
            this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, 5, () => {
                this._manager.setLockTried(this.lock, false);
                this._timeout = null;
                return GLib.SOURCE_REMOVE;
            });
        }
    }
});
