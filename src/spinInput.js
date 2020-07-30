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
/* exported SpinInput */

const {GObject, Gtk} = imports.gi;

var SpinInput = GObject.registerClass({
    GTypeName: 'SpinInput',
    Properties: {
        label: GObject.ParamSpec.string(
            'label', 'Label', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ''),
        digits: GObject.ParamSpec.int(
            'digits', 'Digits', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            0, 20, 0),
        adjustment: GObject.ParamSpec.object(
            'adjustment', 'Adjustment', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            Gtk.Adjustment),
    },
    Template: 'resource:///com/hack_computer/HackToolbox/spininput.ui',
    InternalChildren: ['input', 'label'],
}, class SpinInput extends Gtk.Box {
    _init(props) {
        super._init(props);
        this._input.set_adjustment(this.adjustment);
        this._input.set_digits(this.digits);
        this._label.label = this.label;
    }
});
