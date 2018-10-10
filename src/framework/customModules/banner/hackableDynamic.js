// Copyright 2018 Endless Mobile, Inc.

/* exported HackableDynamic */
/* global custom_modules */

const {Gio, GObject, Gtk} = imports.gi;

const Module = imports.framework.interfaces.module;
// Make sure included for glade template
const DynamicLogo = imports.framework.widgets.dynamicLogo;
const FormattableLabel = imports.framework.widgets.formattableLabel;
const TextFilters = custom_modules.textFilters;
const TextProcessing = custom_modules.textProcessing;
const Utils = imports.framework.utils;

void DynamicLogo;
void FormattableLabel;

const LOGO_URI = 'resource:///app/assets/logo';

var HackableDynamic = new Module.Class({
    Name: 'Banner.HackableDynamic',
    Extends: Gtk.Grid,

    Properties: {
        'show-subtitle': GObject.ParamSpec.boolean('show-subtitle',
            'Show Subtitle', 'Show Subtitle',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            false),
        mode: GObject.ParamSpec.string('mode', 'mode', 'mode',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'text'),
        layout: GObject.ParamSpec.string('layout', 'layout', 'layout',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, 'auto'),
        'format-string': GObject.ParamSpec.string('format-string', 'Format string',
            'The format string for this title',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, '%s'),
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

    Template: 'resource:///com/endlessm/HackToolbox/CustomModules/banner/hackableDynamic.ui',
    InternalChildren: ['subtitle-label', 'logo'],

    _init(props = {}) {
        // We don't want the module to autoexpand, but it will unless explicitly
        // forced not to because logo child has expand=true set.
        props.expand = props.expand || false;
        // eslint-disable-next-line no-restricted-syntax
        this.parent(props);

        if (this.mode !== 'text') {
            const file = Gio.File.new_for_uri(LOGO_URI);
            if (file.query_exists(null))
                this._logo.image_uri = LOGO_URI;
            else
                this.mode = 'text';
        }

        this._logo.mode = this.mode;
        this._logo.layout = this.layout;

        let text = '';
        const app_info = Utils.get_desktop_app_info();
        if (app_info && app_info.get_name())
            text = this.format_string.format(app_info.get_name());
        this._logo.text = this._processText(text);

        let subtitle = '';
        if (app_info)
            subtitle = app_info.get_description();
        if (this.show_subtitle && subtitle) {
            this._subtitle_label.label = this._processText(subtitle);
            this._subtitle_label.justify = Utils.alignment_to_justification(this.halign);
        }
        this._subtitle_label.visible = this.show_subtitle;
    },

    set subtitle(value) {
        if (this._subtitle === value)
            return;
        this._subtitle = value;
        this.notify('subtitle');
    },

    get subtitle() {
        return this._subtitle || '';
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
});
