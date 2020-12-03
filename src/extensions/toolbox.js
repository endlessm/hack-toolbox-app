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
/* exported ExtensionsToolbox */

const {GLib, GObject} = imports.gi;

const {Toolbox} = imports.toolbox;
const {SnowControlPanel} = imports.extensions.snow.controlpanel;
const {ExtensionsCodeview} = imports.extensions.codeview;
const {Model} = imports.extensions.snow.model;

var ExtensionsToolbox = GObject.registerClass(class ExtensionsToolbox extends Toolbox {
    _init(appId, props = {}) {
        const home = GLib.get_home_dir();
        const stylesPath = GLib.build_filenamev([
            home, '.local', 'share', 'gnome-shell', 'extensions',
            'snow@endlessos.org', 'stylesheet.css',
        ]);
        super._init(appId, props);

        this._model = new Model();

        this._signalHandler = this._model.extensionsProxy.connect(
            'g-signal', (proxy, sender, signal, params) => {
                if (!this._lockscreen)
                    return;

                if (signal !== 'ExtensionStateChanged')
                    return;

                const [uuid, info] = params.deep_unpack();
                if (uuid === 'snow@endlessos.org' && info.state)
                    this._lockscreen.locked = info.state.unpack() !== 1;

                this._snowTopic.fillAdjustements();
                this._snowTopic.regenerateCode();
                this._stylesTopic.loadFile();
            });

        this._snowTopic = new SnowControlPanel(this._model);
        this._stylesTopic = new ExtensionsCodeview(this._model, stylesPath);
        this.addTopic('snow', 'Snow', 'weather-snow-symbolic', this._snowTopic);
        this.addTopic('styles', 'Styles', 'color-select-symbolic', this._stylesTopic);
        this.showTopic('snow');
        this.selectTopic('snow');
        this.show_all();
    }

    bindWindow(win) {
        this._lockscreen = win.lockscreen;
        if (this._model.isEnabled('snow@endlessos.org'))
            this._lockscreen.locked = false;

        win.get_style_context().add_class('Extensions');
        win.get_style_context().add_class('Sidetrack');  // use Sidetrack shader
    }

    shutdown() {
        this._model.extensionsProxy.disconnect(this._signalHandler);
    }
});
