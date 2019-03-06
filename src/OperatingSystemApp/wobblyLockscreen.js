/* exported WobblyLockscreen */

const {GLib, GObject} = imports.gi;

const {Lockscreen} = imports.lockscreen;
const SoundServer = imports.soundServer;

var WobblyLockscreen = GObject.registerClass({
    GTypeName: 'WobblyLockscreen',
    CssName: 'wobblylockscreen',
}, class WobblyLockscreen extends Lockscreen {
    _init(props = {}) {
        super._init(props);
        this._trapSequence = null;
        this._playDoneMode = null;
        this._timeout = null;
        this._alarmSoundID = null;
        this.connect('destroy', () => {
            if (this._timeout) {
                this._manager.setLockTried(this.lock, false);
                GLib.Source.remove(this._timeout);
            }
        });
    }

    _updateBackground() {
        super._updateBackground();
        const [assetsPath] = this.getAssetsPath();

        if (this._trapSequence === null)
            return;

        this._playbin.background = `file://${assetsPath}/trap${this._trapSequence}`;
        this._playbin.uri = `file://${assetsPath}/trap${this._trapSequence}.webm`;

        this._stopActiveSound();

        const sound = SoundServer.getDefault();

        switch (this._trapSequence) {
        case 0:
            sound.play(`hack-toolbox/lockscreen/open/${this._lock}`);
            break;
        case 1:
            sound.play('hack-toolbox/lockscreen/trap/glitch');
            break;
        case 2:
            // Last video plays in loop
            this._playDoneMode = 'loop';
            this._alarmSoundID = 'pending';
            sound.playAsync('hack-toolbox/lockscreen/trap/alarm').then(id => {
                if (this._alarmSoundID === 'cancel') {
                    sound.stop(id);
                    this._alarmSoundID = null;
                } else {
                    this._alarmSoundID = id;
                }
            });
            break;
        default:
            throw new Error('This code should not be reached');
        }

        this._playbin.play();
    }

    _updateLockStateWithLock() {
        if (this._manager.isUnlocked(this.lock)) {
            this._playDoneMode = 'end';
            return;
        }

        const trapSequence = this._manager.getTrapSequence(this.lock);

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
        if (this._playDoneMode === 'loop') {
            this._playbin.play();
        } else if (this._playDoneMode === 'end') {
            this._playbin.hide();
            this._playbin.destroy();

            if (this._alarmSoundID) {
                if (this._alarmSoundID === 'pending') {
                    this._alarmSoundID = 'cancel';
                } else {
                    SoundServer.getDefault().stop(this._alarmSoundID);
                    this._alarmSoundID = null;
                }
            }
        }
    }
});
