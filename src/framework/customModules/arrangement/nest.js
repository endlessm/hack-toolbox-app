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
/* exported Nest */

const {Constrained} = imports.framework.modules.arrangement.constrained;
const Module = imports.framework.interfaces.module;

const _CARD_MIN_WIDTH = 100;
const _CARD_MIN_HEIGHT = 100;

var Nest = new Module.Class({
    Name: 'Arrangement.Nest',
    Extends: Constrained,

    // Arrangement override
    get_max_cards() {
        return 6;
    },

    // Arrangement.Constrained override
    get_description() {
        return [
            'H:|-[view0]-[view1]-|',
            'H:|-[view2(view4)]-[view4]-[view5(view4)]-[view1(view4)]-|',
            'H:|-[view2]-[view3]-|',
            'V:|-[view0]-[view2]-|',
            'V:|-[view0(view4)]-[view4]-[view3(view4)]-|',
            'V:|-[view0]-[view5(view4)]-[view3]-|',
            'V:|-[view1]-[view3]-|',
        ];
    },

    vfunc_get_preferred_width() {
        return [_CARD_MIN_WIDTH * 4, _CARD_MIN_WIDTH * 4];
    },

    vfunc_get_preferred_height() {
        return [_CARD_MIN_HEIGHT * 3, _CARD_MIN_HEIGHT * 3];
    },
});
