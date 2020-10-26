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
/* global custom_modules */

const Gettext = imports.gettext;
const {GObject, Gtk} = imports.gi;

const Config = imports.framework.config;
const HistoryStore = imports.framework.historyStore;
const Module = imports.framework.interfaces.module;
const TextFilters = custom_modules.textFilters;
const TextProcessing = custom_modules.textProcessing;
const Utils = imports.framework.utils;

const _ = Gettext.dgettext.bind(null, Config.GETTEXT_PACKAGE);

// eslint-disable-next-line no-unused-vars
var HackableSearch = new Module.Class({
    Name: 'Banner.HackableSearch',
    Extends: Gtk.Label,
    Properties: {
        textfilter: GObject.ParamSpec.string('textfilter', 'Text filter', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            'normal'),
        rotation: GObject.ParamSpec.uint('rotation', 'Rotation',
            'Number of positions to advance each letter in the string',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            0, 25, 0),
        decodefunc: GObject.ParamSpec.string('decodefunc', 'Decode Function',
            'Source code of function to evaluate to decode the text',
            GObject.ParamFlags.WRITABLE | GObject.ParamFlags.CONSTRUCT,
            ''),
    },

    Template:
    'resource:///com/hack_computer/HackToolbox/CustomModules/banner/hackableSearch.ui',

    _init(props = {}) {
        // eslint-disable-next-line no-restricted-syntax
        this.parent(props);
        HistoryStore.get_default().connect('changed',
            this._on_history_changed.bind(this));
    },

    get rotation() {
        return this._rotation;
    },

    set rotation(value) {
        this._rotation = value;
    },

    get decodefunc() {
        throw new Error('property not readable');
    },

    set decodefunc(value) {
        if (!value) {
            this._decodefunc = null;
            return;
        }
        // eslint-disable-next-line no-new-func
        this._decodefunc = new Function('letter', value);
    },

    _processText(text) {
        const caesar = TextProcessing.caesar(text, this._rotation,
            this._decodefunc);
        return TextFilters[this.textfilter](caesar);
    },

    _on_history_changed(store) {
        const item = store.search_backwards(0, it => it.search_terms);
        if (!item || !item.search_terms)
            return;

        // hacky way of preserving the gettext call in case we need it later
        const uiString = _('Results for “%s”').split('%s')
            .map(this._processText, this)
            .join('%s');
        this.label = Utils.format_ui_string(this.get_style_context(),
            uiString, this._processText(item.search_terms), 'search-terms');
    },
});
