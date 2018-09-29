/* exported WindshieldNoise */
/* global custom_modules */

const Module = imports.framework.interfaces.module;
const NoiseArrangement = custom_modules.noiseArrangement;
const {Windshield} = imports.framework.modules.arrangement.windshield;

const proto = NoiseArrangement.generateProto('Arrangement.WindshieldNoise', Windshield, 4);
var WindshieldNoise = new Module.Class(proto);
