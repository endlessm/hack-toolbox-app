/* exported WobblyLockscreen */

const {GLib, GObject} = imports.gi;

const {Lockscreen} = imports.lockscreen;

var WobblyLockscreen = GObject.registerClass({
    GTypeName: 'WobblyLockscreen',
    CssName: 'wobblylockscreen',
}, class WobblyLockscreen extends Lockscreen {
    _init(props = {}) {
        super._init(props);
        this._trapSequence = null;
        this._videoLoops = false;
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
        // eslint-disable-next-line comma-spacing
        const [assetsPath,,] = this.getAssetsPath();

        if (this._trapSequence === null)
            return;

        this._playbin.background = `file://${assetsPath}/trap${this._trapSequence}`;
        this._playbin.uri = `file://${assetsPath}/trap${this._trapSequence}.webm`;

        // Last video plays in loop
        if (this._trapSequence === 2)
            this._videoLoops = true;

        this._playbin.play();
    }

    _updateLockStateWithLock() {
        if (this._manager.isUnlocked(this.lock)) {
            this._playbin.hide();
            this._playbin.destroy();
            return;
        }

        const trapSequence = this._manager.getTrapSequence(this.lock);
        // FIXME check
        if (typeof trapSequence === 'undefined')
            super._updateLockStateWithLock();

        if (typeof trapSequence !== 'undefined' && trapSequence !== this._trapSequence) {
            this._trapSequence = trapSequence;
            super._updateLockStateWithLock();
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
            this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, 5, () => {
                this._manager.setLockTried(this.lock, false);
                this._timeout = null;
                return GLib.SOURCE_REMOVE;
            });
        }
    }

    _onPlayDone() {
        if (this._videoLoops)
            this._playbin.play();
    }
});
