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
/* exported RMZToolbox */

const {Gio, GLib, GObject, Gtk} = imports.gi;

const {RMZUnitsTopic} = imports.RileyMaze.RMZUnit;
const {RMZGlobalModel} = imports.RileyMaze.globalParams;
const {RMZUserFunction} = imports.RileyMaze.userFunction;
const {Toolbox} = imports.toolbox;


var RMZToolbox = GObject.registerClass(class RMZToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);

        const iconTheme = Gtk.IconTheme.get_default();
        iconTheme.add_resource_path('/com/hack_computer/HackToolbox/RileyMaze/icons');

        this._global = new RMZGlobalModel();
        this._instructTopic = new RMZUserFunction('instructions', appId);
        this._instructTopic.bindGlobalModel(this._global);
        this.addTopic('instructions', 'Instructions', 'instructions-symbolic',
            this._instructTopic);
        this.showTopic('instructions');
        this.selectTopic('instructions');

        this._unitTopic = new RMZUnitsTopic();
        this._unitTopic.bindGlobalModel(this._global);

        this.addTopic('unit', 'Unit', 'units-symbolic',
            this._unitTopic, true);
        this.showTopic('unit');
        this.addTopicKeys('unit', 'item.key.sidetrack.2', 'lock.sidetrack.2');

        this._levelTopic = new RMZUserFunction('level', appId);
        this._levelTopic.bindGlobalModel(this._global);
        this.addTopic('level', 'Level', 'levels-symbolic',
            this._levelTopic, true);
        this.addTopicKeys('level', 'item.key.sidetrack.3', 'lock.sidetrack.3');
        this.showTopic('level');

        this._updateLevelInfo();
        this.show_all();

        this._updateLevelHandler = this._global.connect('notify::currentLevel',
            this._updateLevelInfo.bind(this));
        this.connect('reset', this._onReset.bind(this));
    }

    bindWindow(win) {
        win.get_style_context().add_class('Sidetrack');
        win.lockscreen.key = 'item.key.sidetrack.1';
        win.lockscreen.lock = 'lock.sidetrack.1';
        void this;
    }

    _updateLevelInfo() {
        let text = `Level ${this._global.currentLevel}`;
        if (this._global.currentLevel === 0)
            text = 'Intro';
        this.setInfo(text);
    }

    _onReset() {
        Gio.DBus.session.call_sync('com.hack_computer.Sidetrack',
            '/com/hack_computer/Sidetrack', 'org.gtk.Actions', 'Activate',
            new GLib.Variant('(sava{sv})', ['reset', [], {}]),
            null, Gio.DBusCallFlags.NONE, -1, null);
        this._unitTopic.reset();
        this._levelTopic.discardChanges();
    }

    shutdown() {
        super.shutdown();

        if (this._global && this._updateLevelHandler) {
            this._global.disconnect(this._updateLevelHandler);
            this._global = null;
            this._updateLevelHandler = null;
        }

        this._instructTopic.unbindGlobalModel();
        this._unitTopic.unbindGlobalModel();
        this._levelTopic.unbindGlobalModel();
    }
});

