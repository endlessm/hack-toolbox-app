/* exported OverflowNoise */
/* global custom_modules */

const Module = imports.framework.interfaces.module;
const NoiseArrangement = custom_modules.noiseArrangement;
const {Overflow} = imports.framework.modules.arrangement.overflow;

const proto = NoiseArrangement.generateProto('Arrangement.OverflowNoise', Overflow);
var OverflowNoise = new Module.Class(proto);
