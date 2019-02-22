/* exported WobblyLockscreen */
/* global pkg */

const {Gio, GLib, GObject} = imports.gi;

const {Lockscreen} = imports.lockscreen;
const SoundServer = imports.soundServer;

var WobblyLockscreen = GObject.registerClass({
    GTypeName: 'WobblyLockscreen',
    CssName: 'wobblylockscreen',
}, class WobblyLockscreen extends Lockscreen {
    _updateBackground() {
        super._updateBackground();
        const assetsPath = this.getAssetsPath();
        if (this._manager.getTrapSequence(this.lock) === 0) {
            this._playbin.background = `file://${assetsPath}/trap0`;
        }
        if (this._manager.getTrapSequence(this.lock) === 1) {
            this._playbin.background = `file://${assetsPath}/trap1`;
        }
        if (this._manager.getTrapSequence(this.lock) === 2) {
            this._playbin.background = `file://${assetsPath}/trap2`;
        }
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
            GLib.timeout_add_seconds(GLib.PRIORITY_LOW, 5, () => {
                this._manager.setLockTried(this.lock, false);
                return GLib.SOURCE_REMOVE;
            });
        }
    }
});
