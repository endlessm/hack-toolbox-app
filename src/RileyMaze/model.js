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
/* exported RMZModel */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var RMZModel = GObject.registerClass({
    Properties: {
        robotADirection: GObject.ParamSpec.string('robotADirection', 'Robot A direction', 'up',
            _propFlags, 'up'),
        robotBDirection: GObject.ParamSpec.string('robotBDirection', 'Robot B direction', 'up',
            _propFlags, 'up'),
        instructionCode: GObject.ParamSpec.string('instructionCode', 'Instruction code', '',
            _propFlags, ''),
        levelCode: GObject.ParamSpec.string('levelCode', 'level code', '', _propFlags, ''),
    },
}, class RMZModel extends ClippyWrapper {
    _init(level, props = {}) {
        super._init('com.hack_computer.Sidetrack', props, `globalLevel${level}Parameters`);
    }
});
