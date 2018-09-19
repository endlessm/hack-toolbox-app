/* exported NestNoise */
/* global custom_modules */

const Module = imports.framework.interfaces.module;
const {Nest} = custom_modules.arrangement.nest;
const NoiseArrangement = custom_modules.noiseArrangement;

const proto = NoiseArrangement.generateProto('Arrangement.NestNoise', Nest, 6);
var NestNoise = new Module.Class(proto);
