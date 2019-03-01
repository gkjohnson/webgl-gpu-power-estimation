const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const math = require('mathjs');

function fetchData() {

    // load the gpu power table from https://www.videocardbenchmark.net/ and
    // write the dta out into json blobs.
    return fetch('https://www.videocardbenchmark.net/GPU_mega_page.html')
        .then(res => res.text())
        .then(txt => {

            const dom = new JSDOM(txt);
            const document = dom.window.document;

            const table = document.querySelector('#cputable');
            const rows = [ ...table.querySelectorAll('tbody tr') ];

            const originalData = {};
            for (let i = 0, l = rows.length; i < l; i += 2) {

                const infoChildren = rows[i].children;
                const extraChildren = rows[i + 1].children[0];

                const name = infoChildren[0].children[1].innerHTML;
                const g3dPerf = infoChildren[2].innerHTML;
                const g2dPerf = infoChildren[4].innerHTML;
                const tdp = infoChildren[5].innerHTML;
                const testDate = infoChildren[7].innerHTML;
                const type = infoChildren[8].innerHTML;

                const busInterface = extraChildren.children[0].childNodes[1].nodeValue.replace(/^:\s/, '');
                const memory = extraChildren.children[1].childNodes[1].nodeValue.replace(/^:\s/, '');
                const clock = extraChildren.children[2].childNodes[1].nodeValue.replace(/^:\s/, '');
                const memoryClock = extraChildren.children[3].childNodes[1].nodeValue.replace(/^:\s/, '');

                originalData[name] =
                    {

                        name,
                        g3dPerf,
                        g2dPerf,
                        tdp,
                        testDate,
                        type,

                        busInterface,
                        memory,
                        clock,
                        memoryClock,

                    };
            }

            return originalData;
        });

}

function normalizeData(data) {

    const result = {};

    for (const name in data) {

        const {

            g3dPerf,
            g2dPerf,
            tdp,
            type,

            memory,
            clock,
            memoryClock,

        } = data[name];

        // Memory string can be shaped like "256 MB"
        // Math.js uses `MiB` to do power of 2 megabyte conversions
        const cleanedMemory = memory.replace(/,/g, '').replace(/([A-Z])B/g, (match, scale) => `${ scale }iB`);

        // Parse the numeric values
        const parsedTdp = tdp === 'NA' ? null : parseFloat(tdp);
        const parsedMemory = memory === 'NA' ? null : math.unit(cleanedMemory).toNumber('MiB');
        const cleanClock = clock.replace(/,/g, '');
        let parsedClock;

        // If the clock values have a space, dash or slash between them then
        // convert to an average of the two numbers
        const re = /(\d+)[\s-/]+(\d+)/;
        if (re.test(cleanClock)) {

            const unit = cleanClock.replace(re, '').trim();
            const matches = re.exec(cleanClock);
            const val = (parseFloat(matches[1]) + parseFloat(matches[2])) / 2;
            parsedClock = math.unit(val, unit).toNumber('MHz');

        } else {

            try {
                parsedClock = cleanClock === 'NA' ? null : math.unit(cleanClock.replace('Mhz', '')).toNumber('MHz');
            } catch (e) {
                console.error(e);
                console.error(`${ name }, ${ cleanClock }`);
                console.error('');
                parsedClock = null;
            }
        }

        const cleanMemoryClock = memoryClock.replace(/,/g, '');
        let parsedMemoryClock;
        if (re.test(cleanMemoryClock)) {

            const unit = cleanMemoryClock.replace(re, '').trim();
            const matches = re.exec(cleanMemoryClock);
            const val = (parseFloat(matches[1]) + parseFloat(matches[2])) / 2;
            parsedMemoryClock = math.unit(val, unit).toNumber('MHz');

        } else {

            try {
                parsedMemoryClock = cleanMemoryClock === 'NA' ? null : math.unit(cleanMemoryClock.replace(/,/g, '').replace(/\([^)]+\)/, '')).toNumber('MHz');
            } catch (e) {
                console.error(e);
                console.error(`${ name }, ${ cleanMemoryClock }`);
                console.error('');
                parsedMemoryClock = null;
            }
        }

        result[name] =
            {

                name,
                passmark: parseFloat(g3dPerf),
                passmark2d: parseFloat(g2dPerf),

                type,
                tdp: parsedTdp,
                memory: parsedMemory,
                clock: parsedClock,
                memoryClock: parsedMemoryClock,

            };

    }

    return result;

}

module.exports = { fetchData, normalizeData };
