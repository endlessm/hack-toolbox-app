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
/* exported SketchCodeTopic */

const {GObject, Gtk} = imports.gi;

const {Codeview} = imports.codeview;

var SketchCodeTopic = GObject.registerClass({
    Properties: {
        'needs-attention': GObject.ParamSpec.boolean('needs-attention', 'Needs attention',
            'Display an indicator on the button that it needs attention',
            GObject.ParamFlags.READWRITE, false),
    },
}, class SketchCodeTopic extends Gtk.Frame {
    _init(props = {}) {
        super._init(props);

        this._codeview = new Codeview();
        this._codeview.userFunction = 'code';
        this._codeview.connect('should-compile', this._compile.bind(this));

        this.add(this._codeview);

        this.get_style_context().add_class('user-function');
    }

    bindModel(model) {
        this._model = model;
        this._binding = model.bind_property('code', this._codeview, 'text',
            GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE);
    }

    unbindModel() {
        if (this._binding) {
            this._binding.unbind();
            this._binding = null;
        }
        this._model = null;
    }

    _compile() {
        const code = this._codeview.text;

        const scope = {};

        try {
            // eslint-disable-next-line no-new-func
            const func = new Function('scope', `with(scope){\n${code}\n;}`);
            func(scope);
        } catch (e) {
            this.set_property('needs-attention', true);
            if (!(e instanceof SyntaxError || e instanceof ReferenceError))
                throw e;
            this._codeview.setCompileResultsFromException(e);
            return;
        }

        this._codeview.setCompileResults([]);
        this._model.code = code;
        this._model.needsRefresh = true;
        this.set_property('needs-attention', false);
    }
});
