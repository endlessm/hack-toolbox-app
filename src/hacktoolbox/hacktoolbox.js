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
/* exported DefaultHackToolbox */

const {GObject} = imports.gi;

const {Toolbox} = imports.toolbox;

const DATA_RESOURCE_PATH = 'resource:///com/hack_computer/HackToolbox';

var DefaultHackToolbox = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/hacktoolbox/toolbox.ui`,
}, class DefaultHackToolbox extends Toolbox {
    // Intended to be implemented by other toolbox classes, if they need to
    // implement any behaviour before flipping back to the app
    applyChanges(appId, objectPath) {
        void (this, appId, objectPath);
        return Promise.resolve();
    }

    // Intended to be implemented by other toolbox classes, if they need to
    // connect to the window's unlock state.
    bindWindow(win) {
        win.get_style_context().add_class('default');
        void (this, win);
    }
});
