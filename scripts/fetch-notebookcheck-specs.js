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
		const data = {

			name: fields[1],
			codeName: fields[2],
			architecture: fields[3],
			shaders: fields[4],
			coreSpeed: fields[5],
			shaderSpeed: fields[6],

			memorySpeed: fields[8],
			memoryBus: fields[9],
			memoryType: fields[10],
			directX: fields[11],
			openGL: fields[12],
			processNm: fields[13],

			perfRating: fields[15],
			'3dMarkIceStorm': fields[16],
			'3dMarkCloudGateStandard': fields[17],
			'3dMarkcCloudGate': fields[18],
			'3dMarkFireStrikeScore': fields[19],
			'3dMarkFireStrikeGraphics': fields[20],
			'3dMarkTimeSpyScore': fields[21],
			'3dMarkTimeSpyGraphics': fields[22],
			'3dMark11p': fields[23],
			'3dMark11pgpu': fields[24],
			'3dMark11Vantagep': fields[25],
			'3dMarkVantp': fields[26],
			'3dMark06': fields[27],
			'3dMark01': fields[28],
			gfxBench: fields[29],
			gfxBench30: fields[30],
			gfxBench31: fields[31],
			basemark11Med: fields[32],
			basemark11High: fields[33],
			unigineHeaven30: fields[34],
			unigineValley10: fields[35],
			cinebenchR15: fields[36],
			cinebenchR10: fields[37],
			computeMark21: fields[38],
			luxMark20: fields[39]

		};

		database[data.name] = data;

    }

    return database;

}

function normalizeData() {}

module.exports = { fetchData, normalizeData };
