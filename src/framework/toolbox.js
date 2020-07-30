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
/* exported FrameworkToolbox */

const {GLib, GObject, Gtk} = imports.gi;

const {Defaults} = imports.framework.defaults;
const Model = imports.framework.model;
const {RaControlPanel} = imports.framework.controlPanel;
const {Toolbox} = imports.toolbox;

var FrameworkToolbox = GObject.registerClass(class FrameworkToolbox extends Toolbox {
    _init(appId, props = {}) {
        this._timeout = null;

        super._init(appId, props);
        this.show_all();
    }

    // See DefaultHackToolbox
    applyChanges(appId, objectPath) {
        this.setBusy(true);
        this._timeout = GLib.timeout_add_seconds(GLib.PRIORITY_LOW, 5, () => {
            this.setBusy(false);
            this._timeout = null;
            return GLib.SOURCE_REMOVE;
        });
        return this._model.launch(appId, objectPath);
    }

    bindWindow(win) {
        win.get_style_context().add_class('framework');

        const appId = win.target_app_id;
        const defaults = new Defaults(appId);

        const ModelClass = Model.ensureModelClass(appId, defaults);
        this._model = new ModelClass();
        this.connect('reset', () => this._model.reset());
        this._model.connect('notify::changed', () => {
            win.enableFlipBack = this._model.changed;
        });
        this._model.snapshot();  // ignore any initial syncing

        this._controlPanel = new RaControlPanel(defaults, {
            valign: Gtk.Align.START,
            visible: true,
        });
        this._controlPanel.bindModel(this._model);
        this._controlPanel.bindWindow(win);
        this.addTopic('main', 'Tools', 'preferences-other-symbolic', this._controlPanel);
        this.show_all();
        this.selectTopic('main');

        this.setBusy(false);
    }

    // parent class override
    shutdown() {
        super.shutdown();
        if (this._timeout)
            GLib.Source.remove(this._timeout);

        if (this._controlPanel)
            this._controlPanel.unbindModel();
    }
});
