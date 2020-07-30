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
/* exported FizzicsControlPanel */

const {GObject, Gtk} = imports.gi;
const {FizzicsLevel1} = imports.Fizzics.level1;
const {FizzicsLevel2} = imports.Fizzics.level2;
const {Lockscreen} = imports.lockscreen;

var FizzicsControlPanel = GObject.registerClass({
    GTypeName: 'FizzicsControlPanel',
    Template: 'resource:///com/hack_computer/HackToolbox/Fizzics/controlpanel.ui',
    InternalChildren: [
        'panelLevel1',
        'panelLevel2',
    ],
    Properties: {
        'needs-attention': GObject.ParamSpec.boolean('needs-attention', 'Needs attention',
            'Display an indicator on the button that it needs attention',
            GObject.ParamFlags.READWRITE, false),
    },
}, class FizzicsControlPanel extends Gtk.Box {
    _init(props = {}) {
        super._init(props);

        this._level1 = new FizzicsLevel1({visible: true});
        this._level2 = new FizzicsLevel2({visible: true});
        this._level2lock = new Lockscreen({visible: false});

        this._level2lock.add(this._level2);
        this._panelLevel1.add(this._level1);
        this._panelLevel2.add(this._level2lock);
        this._level2lock.show_all();

        this._level2lock.bind_property('locked',
            this._level2, 'update-sound-enabled',
            GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.INVERT_BOOLEAN);

        this._level2.bind_property('needs-attention',
            this, 'needs-attention', GObject.BindingFlags.SYNC_CREATE);
    }

    reset() {
        this._level2.reset();
    }

    bindModel(model) {
        this._level1.bindModel(model);
        this._level2.bindModel(model);
        this._model = model;
    }

    unbindModel() {
        this._model = null;
        this._level1.unbindModel();
        this._level2.unbindModel();
    }

    bindWindow(win) {
        win.lockscreen.key = 'item.key.fizzics.1';
        win.lockscreen.lock = 'lock.fizzics.1';
        this._level2lock.key = 'item.key.fizzics.2';
        this._level2lock.lock = 'lock.fizzics.2';
    }
});
