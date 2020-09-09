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
/* exported SketchMetadataTopic */

const {GObject, Gtk} = imports.gi;

var SketchMetadataTopic = GObject.registerClass({
    GTypeName: 'SketchMetadataTopic',
    Template: 'resource:///com/hack_computer/HackToolbox/sketchbook/metadata.ui',
    InternalChildren: ['descriptionText', 'instructionsText', 'titleText'],
}, class SketchMetadataTopic extends Gtk.Grid {
    bindModel(model) {
        this._model = model;

        const flags = GObject.BindingFlags.BIDIRECTIONAL |
            GObject.BindingFlags.SYNC_CREATE;
        this._bindings = [
            this._model.bind_property('title', this._titleText, 'text', flags),
            this._model.bind_property('description',
                this._descriptionText.buffer, 'text', flags),
            this._model.bind_property('instructions', this._instructionsText,
                'text', flags),
        ];
    }

    unbindModel() {
        if (this._bindings) {
            this._bindings.forEach(binding => binding.unbind());
            this._bindings = null;
        }
        this._model = null;
    }
});
