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
        this._trapSequence = null;
        this._videoLoops = false;
        this._playbin.connect('done', () => {
            log(`MANUQ playbin done ${this._videoLoops}`);
            if (this._videoLoops) {
                this._playbin.play();
            }
        });
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
        const [assetsPath, , ] = this.getAssetsPath();

        log(`MANUQ _updateBackground ${this._trapSequence} ${this._playbin.background}`);
        if (this._trapSequence === 0) {
            log(`MANUQ video: lock opens but there is a trap`);
            this._playbin.background = `file://${assetsPath}/trap0`;
            this._playbin.uri = `file://${assetsPath}/trap0.webm`;
            this._playbin.play();
        }
        if (this._trapSequence === 1) {
            log(`MANUQ video: riley falls into the trap`);
            this._playbin.background = `file://${assetsPath}/trap1`;
            this._playbin.uri = `file://${assetsPath}/trap1.webm`;
            this._playbin.play();
        }
        if (this._trapSequence === 2) {
            log(`MANUQ video: in loop, red alarm`);
            this._videoLoops = true;
            this._playbin.background = `file://${assetsPath}/trap2`;
            this._playbin.uri = `file://${assetsPath}/trap2.webm`;
            this._playbin.play();
        }
    }

    _updateLockStateWithLock() {
        if (this._manager.isUnlocked(this.lock)) {
            log(`MANUQ _updateLockStateWithLock unlocked`);
            this._playbin.hide();
            this._playbin.destroy();
            return;
        }

        const trapSequence = this._manager.getTrapSequence(this.lock);
        log(`MANUQ _updateLockStateWithLock ${trapSequence}`);
        if (typeof trapSequence === 'undefined') {
            super._updateLockStateWithLock();
        }
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
});
