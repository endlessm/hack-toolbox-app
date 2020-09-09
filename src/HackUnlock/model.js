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
/* exported HUModelGlobal */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;

const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

var HUModelGlobal = GObject.registerClass({
    Properties: {
        amplitude: GObject.ParamSpec.double(
            'amplitude', 'amplitude', '',
            _propFlags, 0.0, 1.4, 0.2),
        frequency: GObject.ParamSpec.double(
            'frequency', 'frequency', '',
            _propFlags, 0.0, 50.0, 20.0),
        phase: GObject.ParamSpec.double(
            'phase', 'phase', '',
            _propFlags, -3.0, 3.0, 0.0),
    },
}, class HUModelGlobal extends ClippyWrapper {
    _init(props = {}) {
        super._init('com.hack_computer.HackUnlock', props);
    }
});
