const VB = require('./fetch-videocard-benchmark.js');
const TP = require('./fetch-techpowerup-specs.js');
const NC = require('./fetch-notebookcheck-specs.js');
const { findMatch } = require('../umd/utils.js');
const fs = require('fs');
const path = require('path');

console.log('Normalizing videocard benchmark data...');
VB.data = VB.normalizeData(require('../data/videocard-benchmark-gpus.json'));

console.log('Normalizing techpowerup data...');
TP.data = TP.normalizeData(require('../data/techpowerup-gpus.json'));

console.log('Normalizing notebookcheck data...');
NC.data = NC.normalizeData(require('../data/notebookcheck-gpus.json'));

const result = {};

function getMatch(name, database) {

	const { score, matches } = findMatch(name, Object.keys(database));
	if (score > 0.75) {

		const matchName = matches[0];
		const res = database[matchName];
		delete database[matchName];
		return res;

	}

	return null;

}

function getBaseObject (name) {

	return {
		name,
		names: [name],

		codeName: null,
		architecture: null,
		opengl: null,
		directx: null,

		vendor: null,
		released: null,
		memory: null,
		memoryType: null,

		clock: null,
		memoryClock: null,
		shaderUnits: null,
		renderUnits: null,
		textureUnits: null,

		type: null,
		tdp: null,
	};

}

function joinTPData(data, target) {

	if (!target.names.includes(data.name)) target.names.push(data.name);

	target.vendor = target.vendor || data.vendor;
	target.released = target.released || data.released;
	target.memory = target.memory || data.memory;
	target.memoryType = target.memoryType || data.memoryType;

	target.clock = target.clock || data.clock;
	target.memoryClock = target.memoryClock || data.memoryClock;

	target.shaderUnits = target.shaderUnits || data.shaderUnits;
	target.renderUnits = target.renderUnits || data.renderUnits;
	target.textureUnits = target.textureUnits || data.textureUnits;

}

function joinVBData(data, target) {

	if (!target.names.includes(data.name)) target.names.push(data.name);

	target.memory = target.memory || data.memory;
	target.clock = target.clock || data.clock;
	target.memoryClock = target.memoryClock || data.memoryClock;

	target.type = target.type || data.type;
	target.tdp = target.tdp || data.tdp;

	target.performance = target.performance || data.passmark;
	target.performance2d = target.performance2d || data.passmark2d;

}

function joinNCData(data, target) {

	if (!target.names.includes(data.name)) target.names.push(data.name);

	target.codeName = target.codeName || data.codeName;
	target.architecture = target.architecture || data.architecture;
	target.memoryType = target.memoryType || data.memoryType;
	target.opengl = target.opengl || data.opengl;
	target.directx = target.directx || data.directx;
	target.shaderUnits = target.shaderUnits || data.shaderUnits;

	// TODO: merge all merformance data here

}

// Iterate over all videobenchmark data and try to find any matching
// names in the associated tech powerup data. Only a single graphics card
// is considered a match.
for (const name in VB.data) {

	result[name] = getBaseObject(name);

	let vbDesc = VB.data[name];
	let tpDesc = getMatch(name, TP.data);
	let ncDesc = getMatch(name, NC.data);

	delete VB.data[name];

	if (tpDesc) joinTPData(tpDesc, result[name]);
	if (vbDesc) joinVBData(vbDesc, result[name]);
	if (ncDesc) joinNCData(ncDesc, result[name]);


}

for (const name in TP.data) {

	result[name] = getBaseObject(name);

	let vbDesc = getMatch(name, VB.data);
	let tpDesc = TP.data[name];
	let ncDesc = getMatch(name, NC.data);

	delete TP.data[name];

	if (tpDesc) joinTPData(tpDesc, result[name]);
	if (vbDesc) joinVBData(vbDesc, result[name]);
	if (ncDesc) joinNCData(ncDesc, result[name]);

}

for (const name in NC.data) {

	result[name] = getBaseObject(name);

	let vbDesc = getMatch(name, VB.data);
	let tpDesc = getMatch(name, TP.data);
	let ncDesc = NC.data[name];

	delete NC.data[name];

	if (tpDesc) joinTPData(tpDesc, result[name]);
	if (vbDesc) joinVBData(vbDesc, result[name]);
	if (ncDesc) joinNCData(ncDesc, result[name]);

}

const jsonStr = JSON.stringify(result, null, 4);

let filePath;
filePath = path.join(__dirname, '../data/database.json');
fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });

filePath = path.join(__dirname, '../src/database.js');
const script =
    `const database = ${ jsonStr }\n` +
    'export { database };';
fs.writeFileSync(filePath, script, { encoding: 'utf8' });

console.log('WRITTEN!');
