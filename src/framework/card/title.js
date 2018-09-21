/* exported Title */
// Copyright 2018 Endless Mobile, Inc.

const {GLib, GObject, Gtk} = imports.gi;

const Card = imports.framework.interfaces.card;
const Module = imports.framework.interfaces.module;
const NavigationCard = imports.framework.interfaces.navigationCard;
// Make sure included for glade template
const ThemeableImage = imports.framework.widgets.themeableImage;
const Utils = imports.framework.utils;
const {View} = imports.framework.interfaces.view;

void ThemeableImage;

var Title = new Module.Class({
    Name: 'Card.Title',
    Extends: Gtk.Button,
    Implements: [View, Card.Card, NavigationCard.NavigationCard],

    Properties: {
        'max-title-lines': GObject.ParamSpec.int('max-title-lines', 'Max Title Lines',
            'The maximum number of lines that the title label can wrap ' +
            '(given that it is ellipsizing and wrapping)',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            -1, GLib.MAXINT32, 1),
    },

    Template: 'resource:///com/endlessm/knowledge/data/widgets/card/title.ui',
    InternalChildren: ['title-label'],

    _init(params = {}) {
        // eslint-disable-next-line no-restricted-syntax
        this.parent(params);

        Utils.set_hand_cursor_on_widget(this);
        this.set_title_label_from_model(this._title_label);
        this._title_label_text = this._title_label.label;

        this._title_label.lines = this.max_title_lines;
    },
});
