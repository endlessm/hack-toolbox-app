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
/* exported TiledGridNoise */
/* global custom_modules */

const Module = imports.framework.interfaces.module;
const NoiseArrangement = custom_modules.noiseArrangement;
const {TiledGrid} = imports.framework.modules.arrangement.tiledGrid;

const proto = NoiseArrangement.generateProto('Arrangement.TiledGridNoise', TiledGrid);
var TiledGridNoise = new Module.Class(proto);

// Guard against too many cards being added to this arrangement, as it will
// request too much space. Normally we just don't use it apps in those cases,
// but it's important now as it can be hacked in anywhere.
TiledGridNoise.prototype.get_max_cards = function() {
    return 12;
};
