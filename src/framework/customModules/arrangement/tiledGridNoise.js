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
