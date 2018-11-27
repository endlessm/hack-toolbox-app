/* exported FizzicsModelGlobal, SPECIES, BACKGROUNDS,
SKINS, VFX_BAD, VFX_GOOD, SFX_BAD, SFX_GOOD */

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
var VFX_BAD = [
    'fireworks',
    'splat',
    'vaporized',
    'singularity',
];
var VFX_GOOD = [
    'fireworks',
    'splat',
    'vaporized',
    'singularity',
];
var SFX_BAD = [
    'pop',
    'horn',
    'drum',
    'beam',
];
var SFX_GOOD = [
    'pop',
    'horn',
    'drum',
    'beam',
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
        _propFlags, 0.0, 18.0, 9.0);
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
        _propFlags, 0, 3, 0);
    props[`deathSoundBad-${index}`] = GObject.ParamSpec.uint(
        `deathSoundBad-${index}`, `deathSoundBad-${index}`, '',
        _propFlags, 0, 3, 0);

    props[`deathVisualGood-${index}`] = GObject.ParamSpec.uint(
        `deathVisualGood-${index}`, `deathVisualGood-${index}`, '',
        _propFlags, 0, 3, 0);
    props[`deathSoundGood-${index}`] = GObject.ParamSpec.uint(
        `deathSoundGood-${index}`, `deathSoundGood-${index}`, '',
        _propFlags, 0, 3, 0);
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
        props.appId = 'com.endlessm.Fizzics';
        super._init(props);
    }
});
