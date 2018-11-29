/* exported ListNoise */
/* global custom_modules */

const Module = imports.framework.interfaces.module;
const NoiseArrangement = custom_modules.noiseArrangement;
const {List} = imports.framework.modules.arrangement.list;

const proto = NoiseArrangement.generateProto('Arrangement.ListNoise', List);
var ListNoise = new Module.Class(proto);
