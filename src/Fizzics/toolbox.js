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
/* exported FizzicsToolbox */

const {Gio, GLib, GObject} = imports.gi;

const {Toolbox} = imports.toolbox;
const {FizzicsControlPanel} = imports.Fizzics.controlpanel;
const {FizzicsModelGlobal} = imports.Fizzics.model;

var FizzicsToolbox = GObject.registerClass(class FizzicsToolbox extends Toolbox {
    _init(appId, props = {}) {
        super._init(appId, props);
        this._model = new FizzicsModelGlobal();
        this._controlPanel = new FizzicsControlPanel({visible: true});
        this._controlPanel.bindModel(this._model);
        this.addTopic('main', 'Tools', 'preferences-other-symbolic', this._controlPanel);
        this.show_all();
        this.selectTopic('main');

        this.connect('reset', () => {
            Gio.DBus.session.call_sync(
                'com.hack_computer.Fizzics',
                '/com/hack_computer/Fizzics',
                'org.gtk.Actions', 'Activate',
                new GLib.Variant('(sava{sv})', ['reset', [], {}]),
                null, Gio.DBusCallFlags.NONE, -1, null
            );
            this._controlPanel.reset();
        });
    }

    bindWindow(win) {
        win.get_style_context().add_class('Fizzics');
        this._controlPanel.bindWindow(win);
    }

    shutdown() {
        super.shutdown();
        this._controlPanel.unbindModel();
    }
});
