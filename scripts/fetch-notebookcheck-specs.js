const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const math = require('mathjs');

function innerText(el) {

	if (el.nodeType === 3) return el.nodeValue;

	let str = '';
	[ ...el.childNodes ].forEach(c => str += innerText(c));

	return str;
}

async function fetchData() {

	const body = {
		search: '',
		or: 0,
		deskornote: 2,
		professional: 0,
		multiplegpus: 0,
		month: '',
		showClassDescription: 1,
		perfrating: 1,
		gpu_fullname: 1,
		codename: 1,
		architecture: 1,
		pixelshaders: 1,
		vertexshaders: 1,
		corespeed: 1,
		shaderspeed: 1,
		boostspeed: 1,
		memoryspeed: 1,
		memorybus: 1,
		memorytype: 1,
		directx: 1,
		opengl: 1,
		technology: 1,
		daysold: 1,
		'3dmark13_ice_gpu': 1,
		'3dmark13_cloud': 1,
		'3dmark13_cloud_gpu': 1,
		'3dmark13_fire': 1,
		'3dmark13_fire_gpu': 1,
		'3dmark13_time_spy': 1,
		'3dmark13_time_spy_gpu': 1,
		'3dmark11': 1,
		'3dmark11_gpu': 1,
		vantage3dmark: 1,
		vantage3dmarkgpu: 1,
		'3dmark06': 1,
		'3dmark01': 1,
		glbenchmark: 1,
		gfxbench30: 1,
		gfxbench31: 1,
		basemarkx11_med: 1,
		basemarkx11_high: 1,
		heaven3_dx: 1,
		valley_dx: 1,
		cb15_ogl: 1,
		cinebench10_ogl: 1,
		computemark_result: 1,
		luxmark_sala: 1,
		barlength: 0,
		debug: ''
	};
	const queryString = Object.entries(body).map(arr => arr.join('=')).join('&');
    const req = await fetch('https://dev1.notebook-check.com/index.php?id=844', {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		method: 'POST',
		body: queryString
	});
    const html = await req.text();
	const dom = new JSDOM(html);
	const document = dom.window.document;
	const table = document.querySelector('#sortierbare_tabelle');
	const rows = [ ...table.querySelectorAll('tr') ].filter(el => {
		return /odd|even/.test(el.getAttribute('class'));
	});


    const database = {};
    for (let i = 0; i < rows.length; i++) {

		const row = rows[i];
		const columns = [ ...row.querySelectorAll('td') ];
		const fields = columns.map(c => innerText(c));

		if (columns[4].getAttribute('colspan') === '2') {
			fields.splice(4, 0, fields[4]);
		}

		const daysOld = fields[15];
		let released = null;
		if (daysOld) {

			const date = new Date();
			date.setDate(date.getDate() - parseFloat(daysOld));
			released = date.toDateString();

		}

		const data = {

			name: fields[1],
			codeName: fields[2],
			architecture: fields[3],
			pixelShaders: fields[4],
			vertexShaders: fields[5],
			coreSpeed: fields[6],
			shaderSpeed: fields[7],

			// skip Boost / Turbo

			memorySpeed: fields[9],
			memoryBus: fields[10],
			memoryType: fields[11],
			directX: fields[12],
			openGL: fields[13],
			processNm: fields[14],

			released,

			perfRating: fields[16],
			'3dMarkIceStorm': fields[17],
			'3dMarkCloudGateStandard': fields[18],
			'3dMarkcCloudGate': fields[19],
			'3dMarkFireStrikeScore': fields[20],
			'3dMarkFireStrikeGraphics': fields[21],
			'3dMarkTimeSpyScore': fields[22],
			'3dMarkTimeSpyGraphics': fields[23],
			'3dMark11p': fields[24],
			'3dMark11pgpu': fields[25],
			'3dMark11Vantagep': fields[26],
			'3dMarkVantp': fields[27],
			'3dMark06': fields[28],
			'3dMark01': fields[29],
			gfxBench: fields[30],
			gfxBench30: fields[31],
			gfxBench31: fields[32],
			basemark11Med: fields[33],
			basemark11High: fields[34],
			unigineHeaven30: fields[35],
			unigineValley10: fields[36],
			cinebenchR15: fields[37],
			cinebenchR10: fields[38],
			computeMark21: fields[39],
			luxMark20: fields[40]

		};

		database[data.name] = data;

    }

    return database;

}

function processValue(val) {

	if (val !== '') {

		const parsed = parseFloat(val);
		return parsed;

	} else {

		return null;

	}

}

function normalizeData(database) {

	const result = {};
    for (const name in database) {

		const data = database[name];
		let shaderUnits = null;
		if (data.vertexShaders === data.pixelshaders) {
			shaderUnits = data.vertexShaders;
		}

		result[name] = {

			name,
			codeName: data.codename || null,
			architecture: data.architecture || null,

			memoryType: data.memoryType || null,
			openGL: data.openGL || null,
			directX: data.directX || null,
			clockSpeed: data.coreSpeed || null,

			shaderUnits,
			released: data.released || null,

			'3dMarkIceStorm': 				processValue(data['3dMarkIceStorm']),
			'3dMarkCloudGateStandard': 		processValue(data['3dMarkCloudGateStandard']),
			'3dMarkcCloudGate': 			processValue(data['3dMarkcCloudGate']),
			'3dMarkFireStrikeScore': 		processValue(data['3dMarkFireStrikeScore']),
			'3dMarkFireStrikeGraphics': 	processValue(data['3dMarkFireStrikeGraphics']),
			'3dMarkTimeSpyScore': 			processValue(data['3dMarkTimeSpyScore']),
			'3dMarkTimeSpyGraphics': 		processValue(data['3dMarkTimeSpyGraphics']),
			'3dMark11p': 					processValue(data['3dMark11p']),
			'3dMark11pgpu': 				processValue(data['3dMark11pgpu']),
			'3dMark11Vantagep': 			processValue(data['3dMark11Vantagep']),
			'3dMarkVantp': 					processValue(data['3dMarkVantp']),
			'3dMark06': 					processValue(data['3dMark06']),
			'3dMark01': 					processValue(data['3dMark01']),
			gfxBench:			processValue(data.gfxBench),
			gfxBench30:			processValue(data.gfxBench30),
			gfxBench31:			processValue(data.gfxBench31),
			basemark11Med:		processValue(data.basemark11Med),
			basemark11High:		processValue(data.basemark11High),
			unigineHeaven30:	processValue(data.unigineHeaven30),
			unigineValley10:	processValue(data.unigineValley10),
			cinebenchR15:		processValue(data.cinebenchR15),
			cinebenchR10:		processValue(data.cinebenchR10),
			computeMark21:		processValue(data.computeMark21),
			luxMark20:			processValue(data.luxMark20)

		}

	}

	return result;

}

module.exports = { fetchData, normalizeData };
