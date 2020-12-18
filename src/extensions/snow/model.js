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
/* exported Model */

const {Gio, GLib, GObject} = imports.gi;

var Model = GObject.registerClass({
}, class Model extends GObject.Object {
    _init() {
        this._proxy = new Gio.DBusProxy.new_for_bus_sync(
            Gio.BusType.SESSION,
            0, null,
            'org.gnome.Shell',
            '/org/gnome/Shell',
            'org.gnome.Shell',
            null);

        this._extensionsProxy = new Gio.DBusProxy.new_for_bus_sync(
            Gio.BusType.SESSION,
            0, null,
            'org.gnome.Shell',
            '/org/gnome/Shell',
            'org.gnome.Shell.Extensions',
            null);
    }

    get extensionsProxy() {
        return this._extensionsProxy;
    }

    loadCodeFile(path) {
        void this;
        let code = null;

        try {
            const f = Gio.File.new_for_path(path);
            const [, bytes] = f.load_contents(null);
            code = imports.byteArray.toString(bytes);
        } catch (e) {
            log(`Failed to load code file ${path}`);
            logError(e);
        }

        return code;
    }

    updateCodeFile(path, content) {
        void this;
        try {
            GLib.file_set_contents(path, content);
        } catch (e) {
            log(`Failed to write code file ${path}`);
        }
    }

    setFlakes(name) {
        const myFlakes = {
            snow: ['❄', '❅', '❆'],
            santa: ['🎅', '🤶', '🎄'],
            snowman: ['⛄'],
            cat: ['🐱', '😻', '😸', '😽'],
        };

        this.setVariable('_myFlakes', myFlakes[name]);
    }

    getVariable(name) {
        const code = `global.hackSnow.${name}`;
        const variant = new GLib.Variant('(s)', [code]);
        try {
            const result = this._proxy.call_sync(
                'Eval', variant, Gio.DBusCallFlags.NONE, -1, null);
            const [, json] = result.deep_unpack();
            return JSON.parse(json);
        } catch (e) {
            return 0;
        }
    }

    setVariable(name, value) {
        const code = `global.hackSnow.${name} = ${JSON.stringify(value)}`;
        const variant = new GLib.Variant('(s)', [code]);
        this._proxy.call('Eval', variant, Gio.DBusCallFlags.NONE, -1, null, () => {
            // do nothing
        });
    }

    reloadAllExtensions(callback) {
        const code = 'Main.extensionManager._loadExtensions()';
        const variant = new GLib.Variant('(s)', [code]);
        this._proxy.call('Eval', variant, Gio.DBusCallFlags.NONE, -1, null, callback);
    }

    reloadStyles(uuid) {
        const code = `
let ex = Main.extensionManager.lookup('${uuid}');
let theme = imports.gi.St.ThemeContext.get_for_stage(global.stage).get_theme();
theme.unload_stylesheet(ex.stylesheet);
theme.load_stylesheet(ex.stylesheet);
`;
        const variant = new GLib.Variant('(s)', [code]);
        this._proxy.call('Eval', variant, Gio.DBusCallFlags.NONE, -1, null, () => {
            // do nothing
        });
    }

    isEnabled(uuid) {
        const variant = new GLib.Variant('(s)', [uuid]);
        const result = this._extensionsProxy.call_sync(
            'GetExtensionInfo',
            variant,
            Gio.DBusCallFlags.NONE,
            -1,
            null,
        );
        if (!result)
            return false;

        const [info] = result.deep_unpack();
        if (!info.state)
            return false;

        return info.state.deep_unpack() === 1;
    }
});
