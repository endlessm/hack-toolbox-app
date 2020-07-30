/*
 * Copyright © 2020 Endless OS Foundation LLC.
 *
 * This file is part of hack-toolbox-app
 * (see https://github.com/endlessm/hack-toolbox-app).
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
/* exported WobblyLockscreen */

const {GLib, GObject, Gtk} = imports.gi;

const Clubhouse = imports.clubhouse;
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

        // Ugh, changing the key state will re-enter this function. However,
        // at this point we no longer need to track changes to the key. The
        // lock is open and we've started the end sequence.
        this._untrackKeyChanges();
        this._manager.setUsed(this._key);

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

            if (this._trapSequence === null)
                super._updateLockStateWithLock();

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

            if (this._manager.hasKey('item.key.OperatingSystemApp.2'))
                this._showFakeSanielDialog();
            else
                SoundServer.getDefault().play('hack-toolbox/lockscreen/inactive');
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

    _showFakeSanielDialog() {
        const clubhouse = Clubhouse.getDefault();
        if (['Investigation', 'BreakingIn'].includes(clubhouse.RunningQuest))
            return;

        if (!this._fakeSanielDialog) {
            this._fakeSanielDialog = new Gtk.Overlay({
                halign: Gtk.Align.END,
                name: 'fake-saniel-dialog',
                valign: Gtk.Align.START,
            });
            const frame = new Gtk.Frame({
                shadowType: Gtk.ShadowType.NONE,
            });
            const label = new Gtk.Label({
                label: "You're not allowed here! You better skedaddle! Don't come back!",
                maxWidthChars: 28,
                wrap: true,
                xalign: 0,
            });
            const button = new Gtk.Button({
                halign: Gtk.Align.START,
                label: 'Okay',
                valign: Gtk.Align.END,
            });
            const saniel = new Gtk.Frame({
                halign: Gtk.Align.END,
                name: 'saniel-head',
                shadowType: Gtk.ShadowType.NONE,
                valign: Gtk.Align.FILL,
            });

            this._fakeSanielDialog.add(frame);
            frame.add(label);
            this._fakeSanielDialog.add_overlay(button);
            this._fakeSanielDialog.add_overlay(saniel);
            this.add_overlay(this._fakeSanielDialog);

            button.connect('clicked', () => {
                SoundServer.getDefault().play('clubhouse/dialog/close');
                this._fakeSanielDialog.hide();
            });
        }

        SoundServer.getDefault().play('quests/saniel-angry');
        this._fakeSanielDialog.show_all();
    }
});
