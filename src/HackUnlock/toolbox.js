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
/* exported HUToolbox */

const {GObject, Gtk} = imports.gi;

const {HUControlPanel} = imports.HackUnlock.controlpanel;
const {HUModelGlobal} = imports.HackUnlock.model;

// The HackUnlock toolbox is separate from the normal Toolbox parent class. It's
// got an entirely different design.
var HUToolbox = GObject.registerClass({
    CssName: 'toolbox',
}, class HUToolbox extends Gtk.Grid {
    _init(unusedAppId, props = {}) {
        Object.assign(props, {orientation: Gtk.Orientation.VERTICAL});
        super._init(props);

        this._headerbar = new Gtk.HeaderBar({hasSubtitle: false});
        this.add(this._headerbar);

        this._model = new HUModelGlobal();
        this._controlPanel = new HUControlPanel({visible: true});
        this._controlPanel.bindModel(this._model);
        this.add(this._controlPanel);

        this.show_all();
    }

    bindWindow(win) {
        Object.assign(win.frame, {
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.END,
            margin: 100,
        });

        win.get_style_context().add_class('HackUnlock');
        win.lockscreen.locked = false;
        void this;
    }

    shutdown() {
        void this;
    }
});
