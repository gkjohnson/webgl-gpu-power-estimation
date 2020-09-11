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
		openGL: null,
		directX: null,

		vendor: null,
		released: null,
		memory: null,
		memoryType: null,

		clock: null,
		memoryClock: null,
		shaderUnits: null,
		renderUnits: null,
		textureUnits: null,

		benchmarks: {},
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

	target.benchmarks.passmark = data.passmark;
	target.benchmarks.passmark2d = data.passmark2d;

}

function joinNCData(data, target) {

	if (!target.names.includes(data.name)) target.names.push(data.name);

	target.codeName = target.codeName || data.codeName;
	target.architecture = target.architecture || data.architecture;
	target.clockSpeed = target.clockSpeed || data.clockSpeed;
	target.memoryType = target.memoryType || data.memoryType;
	target.openGL = target.openGL || data.openGL;
	target.directX = target.directX || data.directX;
	target.shaderUnits = target.shaderUnits || data.shaderUnits;
	target.released = target.released || data.released;

	// TODO: merge all merformance data here
	target.benchmarks['3dMarkIceStorm'] = data['3dMarkIceStorm'];
	target.benchmarks['3dMarkCloudGateStandard'] = data['3dMarkCloudGateStandard'];
	target.benchmarks['3dMarkcCloudGate'] = data['3dMarkcCloudGate'];
	target.benchmarks['3dMarkFireStrikeScore'] = data['3dMarkFireStrikeScore'];
	target.benchmarks['3dMarkFireStrikeGraphics'] = data['3dMarkFireStrikeGraphics'];
	target.benchmarks['3dMarkTimeSpyScore'] = data['3dMarkTimeSpyScore'];
	target.benchmarks['3dMarkTimeSpyGraphics'] = data['3dMarkTimeSpyGraphics'];
	target.benchmarks['3dMark11p'] = data['3dMark11p'];
	target.benchmarks['3dMark11pgpu'] = data['3dMark11pgpu'];
	target.benchmarks['3dMark11Vantagep'] = data['3dMark11Vantagep'];
	target.benchmarks['3dMarkVantp'] = data['3dMarkVantp'];
	target.benchmarks['3dMark06'] = data['3dMark06'];
	target.benchmarks['3dMark01'] = data['3dMark01'];
	target.benchmarks.gfxBench = data.gfxBench;
	target.benchmarks.gfxBench30 = data.gfxBench30;
	target.benchmarks.gfxBench31 = data.gfxBench31;
	target.benchmarks.basemark11Med = data.basemark11Med;
	target.benchmarks.basemark11High = data.basemark11High;
	target.benchmarks.unigineHeaven30 = data.unigineHeaven30;
	target.benchmarks.unigineValley10 = data.unigineValley10;
	target.benchmarks.cinebenchR15 = data.cinebenchR15;
	target.benchmarks.cinebenchR10 = data.cinebenchR10;
	target.benchmarks.computeMark21 = data.computeMark21;
	target.benchmarks.luxMark20 = data.luxMark20;

}

// generate a 'performance' field based on all the benchmark data.
// If a passmark benchmark is not available then we interpolate values
// from gpus with similar benchmarks from other vendors
function generatePerformanceScore(database) {

	// find all benchmark information with passmark results
	const benchmarks = Object
		.values(database)
		.map(gpu => gpu.benchmarks)
		.filter(bm => bm.passmark);

	// find the best alternate benchmark data to try to use
	const benchCount = {};
	for(const name in database) {

		const gpu = database[name];
		const benchmarks = gpu.benchmarks;

		for(const benchmarkName in benchmarks) {

			// skip incrementing passmark scores because we treat passmark as the
			// primary score comparison.
			if (benchmarkName === 'passmark' || benchmarkName === 'passmark2d') {

				continue;

			}

			// initialize the number of gpus that have benchmark data with this benchmark as 0
			if(!(benchmarkName in benchCount)) {

				benchCount[benchmarkName] = 0;

			}

			// increment the benchmark count if we see it has a sibling passmark score
			if (benchmarks[benchmarkName] && benchmarks['passmark']) {

				benchCount[benchmarkName] ++;

			}

		}

	}

	// Sort the benchmark names with the most preferred first
	const benchPref = Object
		.entries(benchCount)
		.sort((a, b) => b[1] - a[1])
		.map(el => el[0]);

	for(const name in database) {

		const gpu = database[name];
		let score = null;

		// if a gpu has a passmark score just use that
		if (gpu.benchmarks.passmark) {

			score = gpu.benchmarks.passmark;

		} else {

			// find the best benchmark from the preferred that this gpu
			// has data for
			const benchType = benchPref.filter(b => !!gpu.benchmarks[b])[0];
			if (benchType) {

				// get an array of gpus that have have both the passmark data and
				// performance data for benchType.
				const interpolationArray = benchmarks
					.filter(b => !!b[benchType])
					.sort((a, b) => a[benchType] - b[benchType]);

				// TODO: It might be best to gather many scores and weight
				// the associated passmark scores when generating a new one.
				// Only two GPUs that have a comparable benchmark type are used here.
				const thisRank = gpu.benchmarks[benchType];
				for (let i = 0; i < interpolationArray.length - 1; i++) {

					const curr = interpolationArray[i];
					const next = interpolationArray[i + 1];

					const currbt = curr[benchType];
					const nextbt = next[benchType];

					// iterate up until we find scores that are strictly higher than our score
					if (thisRank < currbt) continue;

					const currp = curr.passmark;
					const nextp = next.passmark;

					// find how far between this and the next score this value is
					const ratio = (thisRank - currbt) / (nextbt - currbt);

					// if the passmark scores are in order (currp is less than nextp),
					// then interpolate as expect. Otherwise reverse the interpolation.
					// TODO: this is redundant...
					if (currp < nextp) {
						score = currp + (nextp - currp) * ratio;
					} else {
						score = nextp + (currp - nextp) * (1 - ratio);
					}

				}

				// if we can't generate a score then see if we're
				// larger or smaller than all elements in the array
				// and use a score from the extreme values
				if (score === null && interpolationArray.length !== 0) {

					if (thisRank < interpolationArray[0][benchType]) {

						score = interpolationArray[0].passmark;

					} else {

						score = interpolationArray[interpolationArray.length - 1].passmark;

					}

				}

			}

		}

		gpu.performance = score;

	}



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

console.log('Generating normalized performance score...');
generatePerformanceScore(result);
Object.values(result).forEach(gpu => delete gpu.benchmarks);

console.log('Writing file...');
const jsonStr = JSON.stringify(result, null, 4);

let filePath;
filePath = path.join(__dirname, '../data/database.json');
fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });
