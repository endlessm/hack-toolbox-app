/* exported TiledGridNoise */
/* global custom_modules */

const Module = imports.framework.interfaces.module;
const NoiseArrangement = custom_modules.noiseArrangement;
const {TiledGrid} = imports.framework.modules.arrangement.tiledGrid;

const proto = NoiseArrangement.generateProto('Arrangement.TiledGridNoise', TiledGrid);
var TiledGridNoise = new Module.Class(proto);
