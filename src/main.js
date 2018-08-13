/* global pkg, _ */
// src/main.js
//
// Copyright (c) 2018 Endless Mobile Inc.
//
// This file is the file first run by the entrypoint to the
// coding-animations-tweak package.
//
pkg.initGettext();
pkg.initFormat();
pkg.require({
    AnimationsDbus: '0',
    Gdk: '3.0',
    GdkPixbuf: '2.0',
    Gtk: '3.0',
    Gio: '2.0',
    GLib: '2.0',
    GObject: '2.0',
});

const {AnimationsDbus, Gdk, GObject, Gio, GLib, Gtk} = imports.gi;

const DATA_RESOURCE_PATH = 'resource:///com/endlessm/CodingAnimationsTweak';

function buildModelFromList(list) {
    let model = Gtk.ListStore.new([GObject.TYPE_STRING]);

    Array.from(list).forEach((l) => model.insert_with_valuesv(-1, [0], [l]));
    return model;
}

const CodingAnimationsTweakSliderSetting = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/coding-animations-tweak-slider-setting.ui`,
    Children: [
        'scale'
    ],
    Properties: {
        'schema': GObject.param_spec_variant('schema',
                                             '',
                                             '',
                                             new GLib.VariantType('a{sv}'),
                                             new GLib.Variant('a{sv}', {}),
                                             GObject.ParamFlags.READWRITE |
                                             GObject.ParamFlags.CONSTRUCT_ONLY),
        'value': GObject.ParamSpec.double('value',
                                          '',
                                          '',
                                          GObject.ParamFlags.READWRITE,
                                          GLib.MININT32,
                                          GLib.MAXINT32,
                                          0)
    }
}, class CodingAnimationsTweakSliderSetting extends Gtk.Box {
    _init(params) {
        super._init(params);

        let schema = this.schema.deep_unpack();

        this.scale.adjustment.lower = schema.min.unpack();
        this.scale.adjustment.upper = schema.max.unpack();
        this.scale.adjustment.value = this.value;

        this.scale.adjustment.bind_property('value',
                                            this,
                                            'value',
                                            GObject.BindingFlags.BIDIRECTIONAL);
    }
});

function constructSettingWidgetForSchema(schema, setting) {
    let unpackedSchema = schema.deep_unpack();
    let type = unpackedSchema.type.unpack();

    switch (type) {
        case 'd':
        case 'u':
        case 'i':
            return new CodingAnimationsTweakSliderSetting({
                visible: true,
                schema: schema,
                value: setting ? setting.unpack() : unpackedSchema.default.unpack()
            });
        default:
            throw new Error(`Don't know how to handle setting type '${type}`);
    }
}

const CodingAnimationsTweakSettingsPanel = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/coding-animations-tweak-settings-panel.ui`,
    Children: [
        'grid',
        'remove-button'
    ],
    Properties: {
        'schema': GObject.param_spec_variant('schema',
                                             '',
                                             '',
                                             new GLib.VariantType('a{sv}'),
                                             new GLib.Variant('a{sv}', {}),
                                             GObject.ParamFlags.READWRITE |
                                             GObject.ParamFlags.CONSTRUCT_ONLY),
        'settings': GObject.param_spec_variant('settings',
                                               '',
                                               '',
                                               new GLib.VariantType('a{sv}'),
                                               new GLib.Variant('a{sv}', {}),
                                               GObject.ParamFlags.READWRITE |
                                               GObject.ParamFlags.CONSTRUCT_ONLY)
    },
    Signals: {
        'changed': {
            param_types: [ GObject.TYPE_VARIANT ]
        },
        'remove-animation': { }
    }
}, class CodingAnimationsTweakSettingsPanel extends Gtk.Box {
    _init(params) {
        super._init(params);

        let schema = this.schema.deep_unpack();
        let settings = this.settings.deep_unpack();

        Object.keys(schema).forEach((key, index) => {
            let type = schema[key].deep_unpack().type.unpack();
            let widget = constructSettingWidgetForSchema(schema[key], settings[key]);
            widget.connect('notify::value', () =>
                this.emit('changed',
                          new GLib.Variant('(sv)',
                                           [key, new GLib.Variant(type, widget.value)]))
            );
            this.grid.attach(new Gtk.Label({
                label: key,
                visible: true,
                xalign: 0
            }), 0, index, 1, 1);
            this.grid.attach(widget, 1, index, 3, 1);
        });

        this.remove_button.connect('clicked', () => this.emit('remove-animation'));
    }
});

const CodingAnimationsTweakLine = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/coding-animations-tweak-line.ui`,
    Children: [
        'event-combo',
        'animation-combo',
        'settings-box'
    ],
    Properties: {
        'animation-client': GObject.ParamSpec.object('animation-client',
                                                     '',
                                                     '',
                                                     GObject.ParamFlags.READWRITE |
                                                     GObject.ParamFlags.CONSTRUCT_ONLY,
                                                     AnimationsDbus.Client),
        'client-surface': GObject.ParamSpec.object('client-surface',
                                                   '',
                                                   '',
                                                   GObject.ParamFlags.READWRITE |
                                                   GObject.ParamFlags.CONSTRUCT_ONLY,
                                                   AnimationsDbus.ClientSurface),
        'effects-for-events': GObject.param_spec_variant('effects-for-events',
                                                         '',
                                                         '',
                                                         new GLib.VariantType('a{sv}'),
                                                         new GLib.Variant('a{sv}', {}),
                                                         GObject.ParamFlags.READWRITE |
                                                         GObject.ParamFlags.CONSTRUCT_ONLY)
    },
    Signals: {
        'remove-animation-entry': {}
    }
}, class CodingAnimationsTweakLine extends Gtk.Box {
    _init(params) {
        super._init(params);

        this.event_combo.set_model(
            buildModelFromList(Object.keys(this.effects_for_events.deep_unpack()))
        );

        this.event_combo.connect('changed', this._onEventComboChanged.bind(this));
        this.animation_combo.connect('changed', this._onAnimationComboChanged.bind(this));

        this._animationEffect = null;
        this._lastEventValue = null;
    }

    remove() {
        if (this._animationEffect && this._lastEventValue) {
            this.client_surface.detach_effect_async(this._lastEventValue, this._animationEffect, null, (src, result) => {
                src.detach_effect_finish(result);
                this.emit('remove-animation-entry');
            });
        }
    }

    _updateStateForEventComboValue() {
        this._lastEventValue = null;

        // Figure out what effects we can have on this event
        let effects = this.effects_for_events.deep_unpack();
        this.animation_combo.set_model(
            buildModelFromList(effects[this.event_combo.get_active_id()].deep_unpack())
        );
        this.event_combo.set_sensitive(true);
        this.animation_combo.set_sensitive(true);

        this._lastEventValue = this.event_combo.get_active_id();
    }

    _onEventComboChanged() {
        this.event_combo.set_sensitive(false);
        this.animation_combo.set_sensitive(false);

        if (this._animationEffect && this._lastEventValue) {
            this.client_surface.detach_effect_async(this._lastEventValue, this._animationEffect, null, (src, result) => {
                src.detach_effect_finish(result);
                this._animationEffect = null;

                this._updateStateForEventComboValue();
            });
        } else {
            GLib.idle_add(GLib.PRIORITY_DEFAULT, () => this._updateStateForEventComboValue());
        }
    }

    _updateStateForAnimationComboValue() {
        let effectName = this.animation_combo.get_active_id();

        this.animation_client.create_animation_effect_async('My Effect', effectName, new GLib.Variant('a{sv}', {}), null, (src, result) => {
            let effect = src.create_animation_effect_finish(result);

            this.client_surface.attach_effect_async(this.event_combo.get_active_id(), effect, null, (src, result) => {
                src.attach_effect_finish(result);

                this._animationEffect = effect;

                this.event_combo.set_sensitive(true);
                this.animation_combo.set_sensitive(true);

                this.settings_box.get_children().forEach(c => this.settings_box.remove(c));

                let panel = new CodingAnimationsTweakSettingsPanel({
                    visible: true,
                    schema: this._animationEffect.schema,
                    settings: this._animationEffect.settings
                });
                panel.connect('changed', (panel, tuple) => {
                    let [name, value] = tuple.deep_unpack();
                    effect.change_setting_async(name, value, null, (source, result) => {
                        source.change_setting_finish(result);
                    });
                });
                panel.connect('remove-animation', () => this.remove());
                this.settings_box.pack_start(panel, true, true, 0);
            });
        });
    }

    _onAnimationComboChanged() {
        this.event_combo.set_sensitive(false);
        this.animation_combo.set_sensitive(false);

        if (this._animationEffect) {
            this.client_surface.detach_effect_async(this.event_combo.get_active_id(), this._animationEffect, null, (src, result) => {
                src.attach_effect_finish(result);
                this._animationEffect = null;

                this._updateStateForAnimationComboValue();
            });
        } else {
            GLib.idle_add(GLib.PRIORITY_DEFAULT, () => this._updateStateForAnimationComboValue());
        }
    }
});

const CodingAnimationsTweakInfo = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/coding-animations-tweak-info.ui`,
    Children: [
        'plus-button'
    ],
    Properties: {
        'ready-to-add': GObject.ParamSpec.boolean('ready-to-add',
                                                  '',
                                                  '',
                                                  GObject.ParamFlags.READWRITE,
                                                  false)
    },
    Signals: {
        'add-new': { }
    }
}, class CodingAnimationsTweakInfo extends Gtk.Box {
    _init(params) {
        super._init(params)

        this.connect('notify::ready-to-add', () =>
            this.plus_button.set_sensitive(this.ready_to_add)
        );
        this.plus_button.connect('clicked', () => this.emit('add-new'));
    }
});

const CodingAnimationsTweakMainWindow = GObject.registerClass({
    Template: `${DATA_RESOURCE_PATH}/coding-animations-tweak-main-window.ui`,
    Children: [
        'layout-box',
        'effects-box',
        'clear-button'
    ],
    Properties: {
        'animation-client': GObject.ParamSpec.object('animation-client',
                                                     '',
                                                     '',
                                                     GObject.ParamFlags.READWRITE |
                                                     GObject.ParamFlags.CONSTRUCT_ONLY,
                                                     AnimationsDbus.Client),
        'surface-object-path': GObject.ParamSpec.string('surface-object-path',
                                                        '',
                                                        '',
                                                        GObject.ParamFlags.READWRITE |
                                                        GObject.ParamFlags.CONSTRUCT_ONLY,
                                                        '')
    },
}, class CodingAnimationsTweakMainWindow extends Gtk.ApplicationWindow {
    _init(params) {
        super._init(params);

        AnimationsDbus.AnimatableSurfaceProxy.new(this.animation_client.connection,
                                                  Gio.DBusProxyFlags.NONE,
                                                  'com.endlessm.Libanimation',
                                                  this.surface_object_path,
                                                  null,
                                                  (source, result) => {
            let proxy = AnimationsDbus.AnimatableSurfaceProxy.new_finish (result);
            this._surface = AnimationsDbus.ClientSurface.new_for_proxy(proxy);

            this._surface.proxy.call_list_effects(null, (source, result) => {
                this._effectsForEvents = source.call_list_effects_finish(result)[1];

                // Now that we're done, we can allow the user to start adding
                // things here. We need to use set_property here to ensure
                // that g_object_notify is called.
                infoBox.set_property('ready-to-add', true);
            });
        });

        let infoBox = new CodingAnimationsTweakInfo({ ready_to_add: false, visible: true });
        infoBox.connect('add-new', () => {
            let line = new CodingAnimationsTweakLine({
                animation_client: this.animation_client,
                client_surface: this._surface,
                effects_for_events: this._effectsForEvents,
                visible: true
            });
            line.connect('remove-animation-entry', (e) => {
                this.effects_box.remove(e);
                if (this.effects_box.get_children().length === 0)
                    this.clear_button.set_sensitive(false);
            });
            this.effects_box.pack_start(line, false, true, 10);
            this.clear_button.set_sensitive(true);
        });
        this.layout_box.add(infoBox);

        this.clear_button.connect('clicked', () => {
            this.effects_box.get_children().forEach(c => c.remove());
        });
    }
});

function load_style_sheet(resourcePath) {
    const provider = new Gtk.CssProvider();
    provider.load_from_resource(resourcePath);
    Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
        provider,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}

const AUTO_CLOSE_MILLISECONDS_TIMEOUT = 12000;

const CodingAnimationsTweakApplication = GObject.registerClass(class extends Gtk.Application {
    _init() {
        this._windows = {};
        this._client = null;

        super._init({
            application_id: pkg.name,
            inactivity_timeout: AUTO_CLOSE_MILLISECONDS_TIMEOUT,
            flags: Gio.ApplicationFlags.IS_SERVICE
        });
        GLib.set_application_name(_('Coding Animations Tweak'));

        let showForSurfacePath = new Gio.SimpleAction({
            name: 'show-for-surface-path',
            parameter_type: new GLib.VariantType('s')
        });
        showForSurfacePath.connect('activate', (action, pathVariant) => {
            let path = pathVariant.deep_unpack();

            // Synchronous, so that if we are activated again
            // we don't try to create the client twice when it
            // wasn't created yet.
            if (!this._client)
                this._client = AnimationsDbus.Client.new();

            if (!this._windows[path]) {
                this._windows[path] = new CodingAnimationsTweakMainWindow({
                    application: this,
                    surface_object_path: path,
                    animation_client: this._client
                });
            }

            this._windows[path].present();
        });
        this.add_action(showForSurfacePath);
    }

    vfunc_startup() {
        super.vfunc_startup();

        const settings = Gtk.Settings.get_default();
        settings.gtk_application_prefer_dark_theme = true;

        load_style_sheet('/com/endlessm/CodingAnimationsTweak/application.css');
    }

    vfunc_activate() {
    }
});


function main(argv) { // eslint-disable-line no-unused-vars
    return (new CodingAnimationsTweakApplication()).run(argv);
}
