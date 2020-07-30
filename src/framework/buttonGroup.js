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
/* exported ButtonGroup */

const {GObject, GLib} = imports.gi;

var ButtonGroup = GObject.registerClass({
    Properties: {
        index: GObject.ParamSpec.uint('index', 'index', '',
            GObject.ParamFlags.READWRITE, 0, GLib.MAXUINT32, 0),
        value: GObject.ParamSpec.string('value', 'Value', '',
            GObject.ParamFlags.READWRITE, ''),
    },
}, class ButtonGroup extends GObject.Object {
    // groupDef: e.g. {'normal': radioButtonNormal, 'eleven': radioButtonEleven}
    _init(groupDef, props = {}) {
        super._init(props);

        this._enumValues = Object.keys(groupDef);
        this._buttons = Object.values(groupDef);
        this._buttons.forEach(button => button.connect('toggled',
            this._updateValue.bind(this)));
        this._updateValue();
    }

    get index() {
        return this._index;
    }

    set index(index) {
        if ('_index' in this && this._index === index)
            return;
        if (index >= this._enumValues.length)
            throw new Error(`Invalid index ${index}`);
        this._index = index;
        this._value = this._enumValues[this._index];
        this._updateUI();
        this.notify('index');
        this.notify('value');
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if ('_value' in this && this._value === value)
            return;
        if (!this._enumValues.includes(value))
            throw new Error(`Invalid value ${value}; expected ${this._enumValues}`);
        this._value = value;
        this._index = this._enumValues.indexOf(value);
        this._updateUI();
        this.notify('value');
        this.notify('index');
    }

    _updateValue() {
        const active = this._buttons.findIndex(button => button.active);
        this.value = this._enumValues[active];
    }

    _updateUI() {
        const active = this._enumValues.indexOf(this._value);
        this._buttons[active].active = true;
    }
});
