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
/* exported HackToolboxApplication */
/* global pkg, _ */

const {Gdk, Gio, GLib, GObject, Gtk} = imports.gi;

const {LocksManager} = imports.locksManager;
const {ToolboxWindow} = imports.window;

function _loadStyleSheet(resourcePath) {
    const provider = new Gtk.CssProvider();
    provider.load_from_resource(resourcePath);
    Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
        provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}

function _toolboxClassForAppId(targetAppId) {
    switch (targetAppId) {
    case 'com.endlessm.dinosaurs.en':
    case 'com.endlessm.encyclopedia.en':
    case 'com.endlessm.Hackdex_chapter_one':
    case 'com.endlessm.Hackdex_chapter_two':
        return imports.framework.toolbox.FrameworkToolbox;
    case 'com.hack_computer.Fizzics':
        return imports.Fizzics.toolbox.FizzicsToolbox;
    case 'com.hack_computer.HackUnlock':
        return imports.HackUnlock.toolbox.HUToolbox;
    case 'com.hack_computer.LightSpeed':
        return imports.LightSpeed.toolbox.LSToolbox;
    case 'com.hack_computer.OperatingSystemApp':
        return imports.OperatingSystemApp.toolbox.OSToolbox;
    case 'com.hack_computer.Sidetrack':
        return imports.RileyMaze.toolbox.RMZToolbox;
    case 'com.hack_computer.Sketchbook':
        return imports.sketchbook.toolbox.SketchToolbox;
    default:
        return imports.hacktoolbox.hacktoolbox.DefaultHackToolbox;
    }
}

function _toolboxIsDecorated(targetAppId) {
    switch (targetAppId) {
    case 'com.hack_computer.HackUnlock':
        return false;
    default:
        return true;
    }
}

const AUTO_CLOSE_MILLISECONDS_TIMEOUT = 12000;

var HackToolboxApplication = GObject.registerClass(class extends Gtk.Application {
    _init() {
        super._init({
            application_id: pkg.name,
            inactivity_timeout: AUTO_CLOSE_MILLISECONDS_TIMEOUT,
            flags: Gio.ApplicationFlags.IS_SERVICE,
        });
        GLib.set_application_name(_('Hack Toolbox'));

        this._windows = {};

        const flip = new Gio.SimpleAction({
            name: 'flip',
            parameter_type: new GLib.VariantType('(ss)'),
        });
        flip.connect('activate', this._onFlip.bind(this));
        this.add_action(flip);

        const init = new Gio.SimpleAction({
            name: 'init',
            parameter_type: new GLib.VariantType('(ss)'),
        });
        init.connect('activate', this._initToolbox.bind(this));
        this.add_action(init);
    }

    _initToolbox(action, parameterVariant) {
        this.hold();
        try {
            const unpacked = parameterVariant.deep_unpack();
            const [appId, windowId] = unpacked;

            if (!this._windows[appId])
                this._windows[appId] = {};

            if (this._windows[appId][windowId])
                this._windows[appId][windowId].destroy();

            const ToolboxClass = _toolboxClassForAppId(appId);
            const toolbox = new ToolboxClass(appId, {visible: true});
            const win = new ToolboxWindow({
                application: this,
                decorated: _toolboxIsDecorated(appId),
                target_app_id: appId,
                target_window_id: windowId,
            });
            win.add(toolbox);
            toolbox.bindWindow(win);

            const settings = Gtk.Settings.get_default();
            settings.gtk_application_prefer_dark_theme = true;

            this._windows[appId][windowId] = win;
            win.connect('destroy', () => {
                delete this._windows[appId][windowId];
            });
        } finally {
            this.release();
        }
    }

    vfunc_startup() {
        super.vfunc_startup();

        _loadStyleSheet('/com/hack_computer/HackToolbox/application.css');

        const iconTheme = Gtk.IconTheme.get_default();
        iconTheme.add_resource_path('/com/hack_computer/HackToolbox/icons');
        iconTheme.add_resource_path('/com/hack_computer/HackToolbox/framework/icons');
        // We need the ability to peek at other apps' icons
        iconTheme.append_search_path('/var/lib/flatpak/exports/share/icons');

        this._locksManager = new LocksManager();
    }

    _onFlip(action, parameterVariant) {
        this.hold();
        const unpacked = parameterVariant.deep_unpack();
        const [appId, windowId] = unpacked;
        log(`Call flip with ${JSON.stringify(unpacked)}`);

        if (!this._windows[appId])
            this._windows[appId] = {};

        if (!this._windows[appId][windowId])
            this._initToolbox(action, parameterVariant);

        this._windows[appId][windowId].present();
        this.release();
    }

    get locksManager() {
        return this._locksManager;
    }
});
