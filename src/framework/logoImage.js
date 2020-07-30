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
/* exported logoIDToResource, LogoImage, VALID_LOGOS */

const {GdkPixbuf, GObject, Gtk} = imports.gi;

var VALID_LOGOS = ['animals', 'art', 'astronomy', 'biology', 'celebrities',
    'clubhouse', 'dinosaur', 'encyclopedia', 'farming', 'geography', 'history',
    'math', 'nature', 'physics', 'soccer', 'socialsciences', 'travel'];

function logoIDToResource(id) {
    return `/com/hack_computer/HackToolbox/framework/${id}.svg`;
}

var LogoImage = GObject.registerClass({
    Properties: {
        resource: GObject.ParamSpec.override('resource', Gtk.Image.$gtype),
    },
}, class LogoImage extends Gtk.Image {
    get resource() {
        return this._resource;
    }

    set resource(value) {
        if ('_resource' in this && this._resource === value)
            return;
        this._resource = value;
        this.pixbuf = GdkPixbuf.Pixbuf.new_from_resource_at_scale(value,
            50, -1, true);
        this.notify('resource');
    }
});
