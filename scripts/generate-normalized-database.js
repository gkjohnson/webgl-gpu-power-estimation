const VB = require('./fetch-videocard-benchmark.js');
const TP = require('./fetch-techpowerup-specs.js');
const { findMatch } = require('../umd/utils.js');
const fs = require('fs');
const path = require('path');

console.log('Normalizing videocard benchmark data...');
VB.data = VB.normalizeData(require('../data/videocard-benchmark-gpus.json'));

console.log('Normalizing techpowerup data...');
TP.data = TP.normalizeData(require('../data/techpowerup-gpus.json'));

const TPKeys = Object.keys(TP.data);
const VBKeys = Object.keys(VB.data);
const database = {};

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
		vendor: null,
		released: null,
		memory: null,
		memoryType: null,

		clock: null,
		memoryClock: null,
		shaderUnits: null,
		renderUnits: null,
		textureUnits: null,

		performance: null,
		performance2d: null,
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

	target.performance = target.performance || data.performance;
	target.performance2d = target.performance2d || data.performance2d;
	target.type = target.type || data.type;
	target.tdp = target.tdp || data.tdp;

}

// Iterate over all videobenchmark data and try to find any matching
// names in the associated tech powerup data. Only a single graphics card
// is considered a match.
for (const name in VB.data) {

	database[name] = getBaseObject(name);

	let vbDesc = VB.data[name];
	let tpDesc = getMatch(name, TP.data);
	let ncDesc = null;

	delete VB.data[name];

	if (tpDesc) joinTPData(tpDesc, database[name]);
	if (vbDesc) joinVBData(vbDesc, database[name]);


}

for (const name in TP.data) {

	database[name] = getBaseObject(name);

	let vbDesc = getMatch(name, VB.data);
	let tpDesc = TP.data[name];
	let ncDesc = null;

	delete TP.data[name];

	if (tpDesc) joinTPData(tpDesc, database[name]);
	if (vbDesc) joinVBData(vbDesc, database[name]);

}

const jsonStr = JSON.stringify(database, null, 4);

let filePath;
filePath = path.join(__dirname, '../data/database.json');
fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });

filePath = path.join(__dirname, '../src/database.js');
const script =
    `const database = ${ jsonStr }\n` +
    'export { database };';
fs.writeFileSync(filePath, script, { encoding: 'utf8' });
