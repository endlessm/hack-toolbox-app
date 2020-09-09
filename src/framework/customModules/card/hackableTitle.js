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
/* exported HackableTitle */
/* global custom_modules */
// Copyright 2018 Endless Mobile, Inc.

const {GLib, GObject, Gtk} = imports.gi;

const Card = imports.framework.interfaces.card;
const Module = imports.framework.interfaces.module;
const NavigationCard = imports.framework.interfaces.navigationCard;
const TextFilters = custom_modules.textFilters;
const TextProcessing = custom_modules.textProcessing;
// Make sure included for glade template
const ThemeableImage = imports.framework.widgets.themeableImage;
const Utils = imports.framework.utils;
const {View} = imports.framework.interfaces.view;

void ThemeableImage;

var HackableTitle = new Module.Class({
    Name: 'Card.HackableTitle',
    Extends: Gtk.Button,
    Implements: [View, Card.Card, NavigationCard.NavigationCard],

    Properties: {
        'max-title-lines': GObject.ParamSpec.int('max-title-lines', 'Max Title Lines',
            'The maximum number of lines that the title label can wrap ' +
            '(given that it is ellipsizing and wrapping)',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            -1, GLib.MAXINT32, 1),
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

    Template: 'resource:///com/hack_computer/HackToolbox/CustomModules/card/hackableTitle.ui',
    InternalChildren: ['title-label'],

    _init(params = {}) {
        // eslint-disable-next-line no-restricted-syntax
        this.parent(params);

        // Drop-in replacement for Card.Title, assume all its theming
        this.get_style_context().add_class('CardTitle');

        Utils.set_hand_cursor_on_widget(this);
        this.set_title_label_from_model(this._title_label);
        this._title_label_text = this._title_label.label;

        this._title_label.lines = this.max_title_lines;
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

    // View override
    set_label_or_hide(label, text) {
        const processedText = this._processText(text);
        label.label = GLib.markup_escape_text(processedText, -1);
        label.visible = !!processedText;
    },
});
