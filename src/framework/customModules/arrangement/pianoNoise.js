/* exported PianoNoise */
/* global custom_modules */

const Module = imports.framework.interfaces.module;
const NoiseArrangement = custom_modules.noiseArrangement;
const {Piano} = imports.framework.modules.arrangement.piano;

const proto = NoiseArrangement.generateProto('Arrangement.PianoNoise', Piano, 4);
var PianoNoise = new Module.Class(proto);
