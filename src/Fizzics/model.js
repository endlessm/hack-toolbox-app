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
/* exported FizzicsModelGlobal, SPECIES, BACKGROUNDS, SKINS, VFXS, SFXS */

const {GObject} = imports.gi;
const {ClippyWrapper} = imports.clippyWrapper;

var SPECIES = 5;
var BACKGROUNDS = [
    'grid',
    'space',
    'grass',
];
var SKINS = [
    'green',
    'spikes',
    'amoeba',
    'spaceship',
    'rocky',
    'earth',
    'cricket',
    'mole',
    'star',
    'sphere',
    'diamond',
];
var VFXS = [
    'confetti',
    'explosion',
    'level_down_red',
    'level_down_dark',
    'life_up',
    'level_up_blue',
    'level_up_dark',
    'vaporized',
    'rainbow',
    'skull',
];
var SFXS = [
    'pop',
    'horn',
    'drum',
    'beam',
    'goal',
    'gem',
    'win',
];

const _indexes = new Array(SPECIES).fill(0)
                                    .map((elem, index) => index);
const _propFlags = GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT;

function _addPropsForIndex(props, index) {
    props[`radius-${index}`] = GObject.ParamSpec.double(
        `radius-${index}`, `radius-${index}`, '',
        _propFlags, 10.0, 100.0, 45.0);
    props[`gravity-${index}`] = GObject.ParamSpec.double(
        `gravity-${index}`, `gravity-${index}`, '',
        _propFlags, -50.0, 50.0, 0.0);
    props[`collision-${index}`] = GObject.ParamSpec.double(
        `collision-${index}`, `collision-${index}`, '',
        _propFlags, 0.0, 0.2, 0.1);
    props[`friction-${index}`] = GObject.ParamSpec.double(
        `friction-${index}`, `friction-${index}`, '',
        _propFlags, 0.0, 100.0, 5.0);
    props[`usePhysics-${index}`] = GObject.ParamSpec.boolean(
        `usePhysics-${index}`, `usePhysics-${index}`, '',
        _propFlags, true);
    props[`imageIndex-${index}`] = GObject.ParamSpec.uint(
        `imageIndex-${index}`, `imageIndex-${index}`, '',
        _propFlags, 0, SKINS.length - 1, index);

    _indexes.forEach(subIndex => {
        props[`socialForce-${index}-${subIndex}`] = GObject.ParamSpec.double(
            `socialForce-${index}-${subIndex}`, `socialForce-${index}-${subIndex}`, '',
            _propFlags, -30.0, 30.0, 0.0);
    });

    props[`deathVisualBad-${index}`] = GObject.ParamSpec.uint(
        `deathVisualBad-${index}`, `deathVisualBad-${index}`, '',
        _propFlags, 0, VFXS.length - 1, 0);
    props[`deathSoundBad-${index}`] = GObject.ParamSpec.uint(
        `deathSoundBad-${index}`, `deathSoundBad-${index}`, '',
        _propFlags, 0, SFXS.length - 1, 0);

    props[`deathVisualGood-${index}`] = GObject.ParamSpec.uint(
        `deathVisualGood-${index}`, `deathVisualGood-${index}`, '',
        _propFlags, 0, VFXS.length - 1, 0);
    props[`deathSoundGood-${index}`] = GObject.ParamSpec.uint(
        `deathSoundGood-${index}`, `deathSoundGood-${index}`, '',
        _propFlags, 0, SFXS.length - 1, 0);
}

function _generateProperties() {
    const props = {};
    props['backgroundImageIndex'] = GObject.ParamSpec.uint(
        'backgroundImageIndex', 'backgroundImageIndex', '',
        _propFlags, 0, 3, 0);
    props['moveToolActive'] = GObject.ParamSpec.boolean(
        'moveToolActive', 'moveToolActive', '',
        _propFlags, false);
    props['flingToolActive'] = GObject.ParamSpec.boolean(
        'flingToolActive', 'flingToolActive', '',
        _propFlags, false);
    props['createToolActive'] = GObject.ParamSpec.boolean(
        'createToolActive', 'createToolActive', '',
        _propFlags, false);
    props['deleteToolActive'] = GObject.ParamSpec.boolean(
        'deleteToolActive', 'deleteToolActive', '',
        _propFlags, false);
    _indexes.forEach(index => {
        _addPropsForIndex(props, index);
    });
    return props;
}

var FizzicsModelGlobal = GObject.registerClass({
    Properties: _generateProperties(),
}, class FizzicsModelGlobal extends ClippyWrapper {
    _init(props = {}) {
        super._init('com.hack_computer.Fizzics', props);
    }
});
