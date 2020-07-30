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
/* exported FrameworkLevel2 */

const {GObject, Gtk} = imports.gi;

const {PopupMenu} = imports.popupMenu;
const {Section} = imports.section;

GObject.type_ensure(Section.$gtype);

var FrameworkLevel2 = GObject.registerClass({
    GTypeName: 'FrameworkLevel2',
    Template: 'resource:///com/hack_computer/HackToolbox/framework/level2.ui',
    InternalChildren: ['cipherAdjustment', 'cipherChooser', 'cipherInput',
        'cipherOutput', 'clickSoundChooser', 'effectButton', 'filterButton',
        'hoverSoundChooser', 'hyperlinksButton'],
}, class FrameworkLevel2 extends Gtk.Grid {
    _init(props = {}) {
        super._init(props);

        this._effectGroup = new PopupMenu(this._effectButton, {
            normal: 'text-transformation-normal-symbolic',
            flipped: 'text-transformation-flipped-symbolic',
            bubbles: 'text-transformation-bubbles-symbolic',
            scrambled: 'text-transformation-scrambled-symbolic',
            creepy: 'text-transformation-creepy-symbolic',
        }, Gtk.Image, 'iconName', {pixelSize: 32});

        this._filterGroup = new PopupMenu(this._filterButton, {
            none: 'image-filter-normal-symbolic',
            disco: 'image-filter-disco-symbolic',
            corduroy: 'image-filter-corduroy-symbolic',
            blueprint: 'image-filter-blueprint-symbolic',
            lensFlare: 'image-filter-lensflare-symbolic',
        }, Gtk.Image, 'iconName', {pixelSize: 32});

        this._cipherChooser.connect('output', entry => {
            entry.text = `+${this._cipherAdjustment.value}`;
            return true;
        });

        this._cipherInput.connect('changed', this._updateCipherOutput.bind(this));
        this._cipherAdjustment.connect('notify::value', this._updateCipherOutput.bind(this));
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;

        const bindingInfo = [
            ['text-transformation', this._effectGroup, 'value'],
            ['image-filter', this._filterGroup, 'value'],
            ['text-cipher', this._cipherAdjustment, 'value'],
            ['hyperlinks', this._hyperlinksButton, 'active'],
            ['sounds-cursor-click', this._clickSoundChooser, 'active-id'],
            ['sounds-cursor-hover', this._hoverSoundChooser, 'active-id'],
        ];

        this._bindings = bindingInfo.map(([prop, target, targetProp]) =>
            model.bind_property(prop, target, targetProp, flags));

        this._model = model;
    }

    unbindModel() {
        this._model = null;

        if (this._bindings) {
            this._bindings.forEach(binding => binding.unbind());
            this._bindings = null;
        }
    }

    _updateCipherOutput() {
        // Adapted from https://gist.github.com/EvanHahn/2587465, public domain
        // Similar to customModules/textProcessing.js but without "decodefunc"
        const decomposedText = this._cipherInput.text.normalize('NFKD');
        const rotation = this._cipherAdjustment.value;
        let output = '';

        for (let i = 0; i < decomposedText.length; i++) {
            let c = decomposedText[i];
            const code = decomposedText.codePointAt(i);

            if (code >= 65 && code <= 90) {
                // Uppercase letters
                c = String.fromCodePoint((code - 65 + rotation) % 26 + 65);
            } else if (code >= 97 && code <= 122) {
                // Lowercase letters
                c = String.fromCodePoint((code - 97 + rotation) % 26 + 97);
            }

            output += c;
        }

        this._cipherOutput.text = output;
    }
});
