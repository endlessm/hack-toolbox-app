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
/* exported LSSpawnTopic */

const {GObject, Gtk} = imports.gi;

const {LSUserFunction} = imports.LightSpeed.userFunction;

var LSSpawnTopic = GObject.registerClass({
    Properties: {
        'needs-attention': GObject.ParamSpec.boolean('needs-attention', 'Needs attention',
            'Display an indicator on the button that it needs attention',
            GObject.ParamFlags.READWRITE, false),
    },
}, class LSSpawnTopic extends Gtk.Grid {
    _init(props = {}) {
        props.orientation = Gtk.Orientation.VERTICAL;
        super._init(props);

        this._spawnEnemy = new LSUserFunction('spawnEnemy');
        this._spawnEnemy.connect('notify::needs-attention',
            this._notifyNeedsAttention.bind(this));
        this.add(this._spawnEnemy);

        this._spawnPowerup = new LSUserFunction('spawnPowerup');
        this._spawnPowerup.connect('notify::needs-attention',
            this._notifyNeedsAttention.bind(this));
        this.add(this._spawnPowerup);
    }

    _notifyNeedsAttention() {
        this.notify('needs-attention');
    }

    get needs_attention() {
        return this._spawnEnemy.needs_attention || this._spawnPowerup.needs_attention;
    }

    bindGlobal(model) {
        this._spawnEnemy.bindGlobal(model);
        this._spawnPowerup.bindGlobal(model);
    }

    unbindGlobalModel() {
        this._spawnEnemy.unbindGlobalModel();
        this._spawnPowerup.unbindGlobalModel();
    }

    discardChanges() {
        this._spawnEnemy.discardChanges();
        this._spawnPowerup.discardChanges();
    }
});
