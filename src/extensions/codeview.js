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
/* exported ExtensionsCodeview */

const {GObject, Gtk} = imports.gi;
const {Codeview} = imports.codeview;

GObject.type_ensure(Codeview.$gtype);

var ExtensionsCodeview = GObject.registerClass({
    GTypeName: 'ExtensionsCodeview',
    Template: 'resource:///com/hack_computer/HackToolbox/Extensions/codeview.ui',
    InternalChildren: [
        'codeview',
    ],
}, class ExtensionsCodeview extends Gtk.Grid {
    _init(model, path, props = {}) {
        super._init(props);
        this._model = model;
        this._path = path;

        this.loadFile();

        this._codeview.connect('should-compile',
            (widget, userInitiated) => this._compile(userInitiated));
    }

    loadFile() {
        this._codeview.text = this._model.loadCodeFile(this._path);
    }

    _compile(userInitiated) {
        this._model.updateCodeFile(this._path, this._codeview.text);
        if (userInitiated)
            this._model.reloadStyles('snow@endlessos.org');
    }
});
