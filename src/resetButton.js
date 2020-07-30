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
/* exported ResetButton */

const {GObject, Gtk} = imports.gi;

const GameState = imports.gameState;
const Signals = imports.signals;

const RESET_BUTTON_KEY = 'app.hack_toolbox.reset_button';

var ResetButton = GObject.registerClass({}, class ResetButton extends Gtk.Button {
    _init(props = {}) {
        Object.assign(props, {noShowAll: true});
        super._init(props);

        const box = new Gtk.Grid({
            orientation: Gtk.Orientation.HORIZONTAL,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.CENTER,
        });
        const label = new Gtk.Label({
            label: 'reset all',
            valign: Gtk.Align.CENTER,
        });
        const image = new Gtk.Image({
            iconName: 'reset-button-symbolic',
            pixelSize: 18,
            valign: Gtk.Align.CENTER,
        });

        box.add(label);
        box.add(image);
        box.show_all();
        this.add(box);

        this.get_style_context().add_class('reset');

        const gameState = GameState.getDefault();
        gameState.getDictValue(RESET_BUTTON_KEY, 'visible', false)
            .then(value => (this.visible = value));
        Signals._connect.call(gameState, 'changed', this._onGameStateChanged.bind(this));
    }

    _onGameStateChanged(self, senderName, [key, value]) {
        if (key !== RESET_BUTTON_KEY)
            return;
        this.visible = value.deep_unpack().visible;
    }
});
