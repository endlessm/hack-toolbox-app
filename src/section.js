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
/* exported Section */

const {GObject, Gtk} = imports.gi;

var Section = GObject.registerClass({
    GTypeName: 'Section',

    Properties: {
        heading: GObject.ParamSpec.string('heading', 'Heading', '',
            GObject.ParamFlags.READWRITE, ''),
    },

    Template: 'resource:///com/hack_computer/HackToolbox/section.ui',
    InternalChildren: ['label'],
}, class Section extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);
    }

    get heading() {
        return this._label.label;
    }

    set heading(value) {
        if (this._label.label === value)
            return;
        this._label.label = value;
        this.notify('heading');
    }
});
