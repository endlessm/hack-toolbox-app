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
/* exported PopupMenu */
const {GLib, GObject, Gtk} = imports.gi;

var PopupMenu = GObject.registerClass({
    Properties: {
        value: GObject.ParamSpec.string('value', 'Value', '',
            GObject.ParamFlags.READWRITE, ''),
        index: GObject.ParamSpec.uint('index', 'Index', '',
            GObject.ParamFlags.READWRITE, 0, GLib.MAXUINT32, 0),
    },
}, class PopupMenu extends GObject.Object {
    _init(button, groupDef, ItemClass, itemProp, itemExtraProps, props = {}) {
        let defaultKey, defaultValue;
        // Special case when groupDef is an array with integer indices, because
        // Object.keys() and Object.entries() would convert them to strings
        if (groupDef instanceof Array) {
            this._enumMap = new Map();
            groupDef.forEach((value, ix) => this._enumMap.set(ix, value));
            defaultKey = 0;
            defaultValue = groupDef[defaultKey];
        } else {
            const entries = Object.entries(groupDef);
            this._enumMap = new Map(entries);
            [[defaultKey, defaultValue]] = entries;
        }
        this._indexMap = Object.values(groupDef);
        this._value = defaultKey;

        this._button = button;
        const selectedProps = {[itemProp]: defaultValue, visible: true};
        Object.assign(selectedProps, itemExtraProps);
        this._selected = new ItemClass(selectedProps);

        this._selectedContainer = new Gtk.Overlay({visible: true});
        this._selectedContainer.add(this._selected);
        const arrow = new Gtk.Image({
            iconName: 'pan-down-symbolic',
            iconSize: Gtk.IconSize.BUTTON,
            halign: Gtk.Align.END,
            valign: Gtk.Align.END,
            visible: true,
        });
        this._selectedContainer.add_overlay(arrow);

        arrow.get_style_context().add_class('dropdown');
        this._selected.get_style_context().add_class('selected-contents');

        this._button.add(this._selectedContainer);

        super._init(props);

        this._menu = new Gtk.Popover();
        this._menu.get_style_context().add_class('popup-menu');
        const [minChildrenPerLine, maxChildrenPerLine] = this._getChildrenPerLine();
        this._choices = new Gtk.FlowBox({
            homogeneous: true,
            rowSpacing: 6,
            columnSpacing: 6,
            minChildrenPerLine,
            maxChildrenPerLine,
            visible: true,
        });
        this._button.popover = this._menu;

        this._menu.add(this._choices);
        [...this._enumMap.entries()].forEach(([enumValue, propValue]) => {
            const choiceProps = {[itemProp]: propValue, visible: true};
            Object.assign(choiceProps, itemExtraProps);
            const choice = new ItemClass(choiceProps);
            choice._enumValue = enumValue;
            this._choices.add(choice);
        });

        this._button.connect('clicked', this._onClicked.bind(this));
        this._choices.connect('child-activated', this._onChoicesActivated.bind(this));

        this._itemProp = itemProp;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (this._value === value)
            return;
        this._selected[this._itemProp] = this._enumMap.get(value);
        this._value = value;
        this.notify('value');
        this.notify('index');
    }

    get index() {
        return this._indexMap.findIndex(value => value === this._value);
    }

    set index(value) {
        this.value = this._indexMap[value];
    }

    get validIds() {
        return [...this._enumMap.keys()];
    }

    _getChildrenPerLine() {
        const nchildren = this._enumMap.size;
        if (nchildren >= 16)
            return [4, 4];
        if (nchildren >= 12)
            return [3, 4];
        if (nchildren >= 9)
            return [3, 3];
        if (nchildren >= 4)
            return [2, 3];
        return [2, 2];
    }

    _onClicked() {
        // Not sure why the selection doesn't persist when the FlowBox is hidden
        const selectChild = this._choices.get_children().find(child =>
            child.get_child()._enumValue === this.value);
        this._choices.select_child(selectChild);
        // Must also be focused to improve usability and visual consistency
        selectChild.grab_focus();
    }

    _onChoicesActivated(widget, child) {
        this._choices.select_child(child);
        const choice = child.get_child();  // child of the FlowBoxChild
        this.value = choice._enumValue;
        this._menu.popdown();
    }
});
