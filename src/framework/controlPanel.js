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
        this._level2 = new FrameworkLevel2({visible: true, hexpand: true});
        this._secondLock = new Lockscreen({
            hexpand: true,
            valign: Gtk.Align.START,
            visible: true,
        });

        if (defaults.shouldLockLevel1) {
            this._secondLock.add(this._level1);
            this.attach(this._secondLock, 0, 0, 1, 1);
            this.attach(this._level2, 0, 1, 1, 1);
        } else {
            this._secondLock.add(this._level2);
            this.attach(this._level1, 0, 0, 1, 1);
            this.attach(this._secondLock, 0, 1, 1, 1);
        }

        this._level3lock = new Lockscreen({
            valign: Gtk.Align.START,
            visible: false,
            noShowAll: true,
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

    unbindModel() {
        this._level1.unbindModel();
        this._level2.unbindModel();
        this._level3.unbindModel();
    }

    bindWindow(win) {
        this._secondLock.connect('notify::locked', () => {
            if (!this._level2lock.locked)
                this._level3lock.show_all();
        });

        win.lockscreen.key = this._key1;
        win.lockscreen.lock = this._lock1;
        this._secondLock.key = this._key2;
        this._secondLock.lock = this._lock2;
        this._level3lock.key = this._key3;
        this._level3lock.lock = this._lock3;
    }
});
