/* exported HackableTitle */
/* global custom_modules */
// Copyright 2018 Endless Mobile, Inc.

const {GLib, GObject, Gtk} = imports.gi;

const Card = imports.framework.interfaces.card;
const Module = imports.framework.interfaces.module;
const NavigationCard = imports.framework.interfaces.navigationCard;
const TextFilters = custom_modules.textFilters;
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
    },

    Template: 'resource:///com/endlessm/HackToolbox/CustomModules/card/hackableTitle.ui',
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

    _processText(text) {
        const decomposedText = text.normalize('NFKD');
        return TextFilters[this.textfilter](decomposedText);
    },

    // View override
    set_label_or_hide(label, text) {
        const processedText = this._processText(text);
        label.label = GLib.markup_escape_text(processedText, -1);
        label.visible = !!processedText;
    },
});
