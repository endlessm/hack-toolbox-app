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
/* exported LSGlobalModel */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;
const {LSModel} = imports.LightSpeed.model;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var LSGlobalModel = GObject.registerClass({
    Properties: {
        availableLevels: GObject.ParamSpec.double('availableLevels', 'Available levels', '',
            _propFlags, 0, Number.MAX_SAFE_INTEGER, 2),
        currentLevel: GObject.ParamSpec.double('currentLevel', 'Current level', '',
            _propFlags, 0, Number.MAX_SAFE_INTEGER, 0),
        updateAsteroidCode: GObject.ParamSpec.string('updateAsteroidCode',
            'Update asteroid code', '', _propFlags, ''),
        updateSpinnerCode: GObject.ParamSpec.string('updateSpinnerCode',
            'Update spinner code', '', _propFlags, ''),
        updateSquidCode: GObject.ParamSpec.string('updateSquidCode',
            'Update squid code', '', _propFlags, ''),
        updateBeamCode: GObject.ParamSpec.string('updateBeamCode',
            'Update beam code', '', _propFlags, ''),
        activatePowerupCode: GObject.ParamSpec.string('activatePowerupCode',
            'Activate powerup code', '', _propFlags, ''),
    },
}, class LSGlobalModel extends ClippyWrapper {
    _init(level, props = {}) {
        super._init('com.hack_computer.LightSpeed', props);
        this._models = [];
    }

    getModel(level) {
        if (typeof this._models[level] === 'undefined')
            this._models[level] = new LSModel(level);
        return this._models[level];
    }
});
