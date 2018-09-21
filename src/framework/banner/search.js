// Copyright 2018 Endless Mobile, Inc.

/* exported Search */

const Gettext = imports.gettext;
const {Gtk} = imports.gi;

const Config = imports.framework.config;
const HistoryStore = imports.framework.historyStore;
const Module = imports.framework.interfaces.module;
const Utils = imports.framework.utils;

const _ = Gettext.dgettext.bind(null, Config.GETTEXT_PACKAGE);

var Search = new Module.Class({
    Name: 'Banner.Search',
    Extends: Gtk.Label,

    Template: 'resource:///com/endlessm/knowledge/data/widgets/banner/search.ui',

    _init(props = {}) {
        // eslint-disable-next-line no-restricted-syntax
        this.parent(props);
        HistoryStore.get_default().connect('changed',
            this._on_history_changed.bind(this));
    },

    _on_history_changed: function (store) {
        const item = store.search_backwards(0, it => it.search_terms);
        if (!item || !item.search_terms)
            return;

        this.label = Utils.format_ui_string(this.get_style_context(),
            _('Results for “%s”'), item.search_terms, 'search-terms');
    },
});
