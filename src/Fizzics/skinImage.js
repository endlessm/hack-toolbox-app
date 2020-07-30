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
/* exported FizzicsSkinImage */

const {GdkPixbuf, GLib, GObject, Gtk} = imports.gi;

var FizzicsSkinImage = GObject.registerClass({
    Properties: {
        index: GObject.ParamSpec.uint(
            'index', 'index', 'index',
            GObject.ParamFlags.READWRITE,
            0, GLib.MAXUINT32, 0),
        pixels: GObject.ParamSpec.uint(
            'pixels', 'pixels', 'pixels',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            0, 64, 64),
        'resource-path': GObject.ParamSpec.string(
            'resource-path', 'resource-path', 'resource-path',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT,
            '/com/hack_computer/HackToolbox/Fizzics/skins'),
    },
}, class FizzicsSkinImage extends Gtk.Image {
    get index() {
        return this._index;
    }

    set index(value) {
        if ('_index' in this && this._index === value)
            return;
        this._index = value;
        const resource = `${this.resource_path}/${value}.png`;
        this.pixbuf = GdkPixbuf.Pixbuf.new_from_resource_at_scale(
            resource, this.pixels, this.pixels, true);
        this.notify('index');
    }
});
