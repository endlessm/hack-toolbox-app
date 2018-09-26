// Copyright 2018 Endless Mobile, Inc.

/* exported HackableSearch */
/* global custom_modules */

const Gettext = imports.gettext;
const {GObject, Gtk} = imports.gi;

const Config = imports.framework.config;
const HistoryStore = imports.framework.historyStore;
const Module = imports.framework.interfaces.module;
const TextFilters = custom_modules.textFilters;
const Utils = imports.framework.utils;

const _ = Gettext.dgettext.bind(null, Config.GETTEXT_PACKAGE);

var HackableSearch = new Module.Class({
    Name: 'Banner.HackableSearch',
    Extends: Gtk.Label,
    Properties: {
        textfilter: GObject.ParamSpec.string('textfilter', 'Text filter', '',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            'normal'),
    },

    Template: 'resource:///com/endlessm/HackToolbox/CustomModules/banner/hackableSearch.ui',

    _init(props = {}) {
        // eslint-disable-next-line no-restricted-syntax
        this.parent(props);
        HistoryStore.get_default().connect('changed',
            this._on_history_changed.bind(this));
    },

    _processText(text) {
        const decomposedText = text.normalize('NFKD');
        return TextFilters[this.textfilter](decomposedText);
    },

    _on_history_changed: function (store) {
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
