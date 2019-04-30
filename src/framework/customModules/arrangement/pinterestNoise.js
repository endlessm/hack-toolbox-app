/* exported PinterestNoise */
/* global custom_modules */

const Module = imports.framework.interfaces.module;
const NoiseArrangement = custom_modules.noiseArrangement;
const {Pinterest} = custom_modules.arrangement.pinterest;

const proto = NoiseArrangement.generateProto('Arrangement.PinterestNoise',
    Pinterest);
var PinterestNoise = new Module.Class(proto);
