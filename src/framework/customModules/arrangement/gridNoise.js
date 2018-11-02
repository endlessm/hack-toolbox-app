/* exported GridNoise */
/* global custom_modules */

const Module = imports.framework.interfaces.module;
const NoiseArrangement = custom_modules.noiseArrangement;
const {Grid} = imports.framework.modules.arrangement.grid;

const proto = NoiseArrangement.generateProto('Arrangement.GridNoise', Grid);
var GridNoise = new Module.Class(proto);
