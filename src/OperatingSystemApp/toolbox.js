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
/* exported OSToolbox */

const {GObject, Gtk} = imports.gi;

const {OSControlPanel} = imports.OperatingSystemApp.controlpanel;
const {Toolbox} = imports.toolbox;
const {WobblyPanel} = imports.OperatingSystemApp.wobblypanel;


var OSToolbox = GObject.registerClass(class OSToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);

        /* Setup icons path */
        var theme = Gtk.IconTheme.get_default();
        theme.add_resource_path('/com/hack_computer/HackToolbox/OperatingSystemApp/icons');

        this._controlPanel = new OSControlPanel({visible: true});
        this.addTopic('main', 'Cursor', 'cursor-symbolic', this._controlPanel);
        this.show_all();
        this.selectTopic('main');
        this._wobblyPanel = new WobblyPanel({visible: true});
        this.addTopic('wobblyPanel', 'Windows', 'wobbly-windows-symbolic', this._wobblyPanel);
        this.showTopic('wobblyPanel');

        this.connect('reset', () => {
            this._controlPanel.reset();
            this._wobblyPanel.reset();
        });
    }

    bindWindow(win) {
        win.lockscreen.key = 'item.key.OperatingSystemApp.1';
        win.lockscreen.lock = 'lock.OperatingSystemApp.1';
        this._wobblyPanel.wobblyLock.key = 'item.key.OperatingSystemApp.2';
        this._wobblyPanel.wobblyLock.lock = 'lock.OperatingSystemApp.2';
        this._controlPanel.codeLock.key = 'item.key.OperatingSystemApp.3';
        this._controlPanel.codeLock.lock = 'lock.OperatingSystemApp.3';
        this._wobblyPanel._codeLock.key = 'item.key.OperatingSystemApp.3';
        this._wobblyPanel._codeLock.lock = 'lock.OperatingSystemApp.3';
        win.get_style_context().add_class('OperatingSystemApp');
    }
});

