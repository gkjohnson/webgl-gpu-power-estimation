const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const math = require('mathjs');
const fs = require('fs');
const path = require('path');

fetch('https://www.videocardbenchmark.net/GPU_mega_page.html')
    .then(res => res.text())
    .then(txt => {

        const dom = new JSDOM(txt);
        const document = dom.window.document;

        const table = document.querySelector('#cputable');
        const rows = [ ...table.querySelectorAll('tbody tr') ];

        const originalData = {};
        const data = {};
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

            const parsedTdp = tdp === 'NA' ? null : parseFloat(tdp);
            const parsedMemory = memory === 'NA' ? null : math.unit(memory.replace(/,/g, '')).toNumber('MB');
            const cleanClock = clock.replace(/,/g, '');
            let parsedClock;

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

            data[name] =
                {

                    name,
                    performance: parseFloat(g3dPerf),
                    performance2d: parseFloat(g2dPerf),

                    type,
                    tdp: parsedTdp,
                    memory: parsedMemory,
                    clock: parsedClock,
                    memoryClock: parsedMemoryClock,

                };

        }

        fs.writeFileSync(path.join(__dirname, '../data/videocard-benchmark-gpus.json'), JSON.stringify(originalData, null, 4), { encoding: 'utf8' });
        fs.writeFileSync(path.join(__dirname, '../data/database.json'), JSON.stringify(data, null, 4), { encoding: 'utf8' });

    });
