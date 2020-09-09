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
/* exported FrameworkLevel1 */

const {GObject, Gtk} = imports.gi;

const {logoIDToResource, LogoImage, VALID_LOGOS} = imports.framework.logoImage;
const {PopupMenu} = imports.popupMenu;
const {Section} = imports.section;

GObject.type_ensure(Section.$gtype);

var FrameworkLevel1 = GObject.registerClass({
    GTypeName: 'FrameworkLevel1',
    Template: 'resource:///com/hack_computer/HackToolbox/framework/level1.ui',
    InternalChildren: ['accentColorButton', 'borderColorButton',
        'borderWidthAdjustment', 'fontChooser', 'fontRenderer',
        'fontSizeAdjustment', 'infoColorButton', 'layoutButton', 'logoButton',
        'logoColorButton', 'mainColorButton', 'orderButton'],
}, class FrameworkLevel1 extends Gtk.Grid {
    _init(defaults, props = {}) {
        super._init(props);

        const fontList = Gtk.ListStore.new([GObject.TYPE_STRING]);
        defaults.fonts.forEach(fontFamily => {
            const iter = fontList.append();
            fontList.set(iter, [0], [fontFamily]);
        });
        this._fontChooser.model = fontList;
        this._fontChooser.idColumn = 0;
        this._fontChooser.add_attribute(this._fontRenderer, 'text', 0);

        this._layoutGroup = new PopupMenu(this._layoutButton, {
            tiledGrid: 'tiled-grid-symbolic',
            windshield: 'windshield-symbolic',
            piano: 'piano-symbolic',
            nest: 'nest-symbolic',
            overflow: 'overflow-symbolic',
            grid: 'grid-symbolic',
            list: 'list-symbolic',
        }, Gtk.Image, 'iconName', {pixelSize: 32});

        const logoChoices = {};
        VALID_LOGOS.forEach(name => {
            logoChoices[name] = logoIDToResource(name);
        });
        this._logoGroup = new PopupMenu(this._logoButton, logoChoices,
            LogoImage, 'resource', {});

        this._orderGroup = new PopupMenu(this._orderButton, {
            ordered: 'card-order-ordered-symbolic',
            random: 'card-order-random-symbolic',
            az: 'card-order-a-z-symbolic',
            za: 'card-order-z-a-symbolic',
        }, Gtk.Image, 'iconName', {pixelSize: 32});
    }

    bindModel(model) {
        const flags = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE;

        const bindingInfo = [
            ['accent-color', this._accentColorButton, 'rgba'],
            ['border-color', this._borderColorButton, 'rgba'],
            ['border-width', this._borderWidthAdjustment, 'value'],
            ['card-layout', this._layoutGroup, 'value'],
            ['card-order', this._orderGroup, 'value'],
            ['font', this._fontChooser, 'active-id'],
            ['font-size', this._fontSizeAdjustment, 'value'],
            ['info-color', this._infoColorButton, 'rgba'],
            ['logo-color', this._logoColorButton, 'rgba'],
            ['logo-graphic', this._logoGroup, 'value'],
            ['main-color', this._mainColorButton, 'rgba'],
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
});
