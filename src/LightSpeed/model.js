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
/* exported LSModel */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var LSModel = GObject.registerClass({
    Properties: {
        scoreTarget: GObject.ParamSpec.double('scoreTarget', 'Score target', '',
            _propFlags, 1, Number.MAX_SAFE_INTEGER, 5),
        astronautSize: GObject.ParamSpec.double('astronautSize', 'Astronaut size', '',
            _propFlags, 1, 2000, 30),
        shipAsset: GObject.ParamSpec.string('shipAsset', 'Ship asset', '',
            _propFlags, 'ship'),
        shipSize: GObject.ParamSpec.double('shipSize', 'Ship size', '',
            _propFlags, 1, 2000, 50),
        shipSpeed: GObject.ParamSpec.double('shipSpeed', 'Ship speed', '',
            _propFlags, 0, Number.MAX_SAFE_INTEGER, 500),
        spawnEnemyCode: GObject.ParamSpec.string('spawnEnemyCode',
            'Spawn enemy code', '', _propFlags, ''),
        spawnPowerupCode: GObject.ParamSpec.string('spawnPowerupCode',
            'Spawn powerup code', '', _propFlags, ''),
    },
}, class LSModel extends ClippyWrapper {
    _init(level, props = {}) {
        super._init('com.hack_computer.LightSpeed', props, `globalLevel${level}Parameters`);
    }
});
