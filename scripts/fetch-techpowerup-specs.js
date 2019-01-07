const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const math = require('mathjs');

async function getGenerationOptions() {

    const req = await fetch('https://www.techpowerup.com/gpu-specs/?sort=name&ajax=1');
    const json = await req.json();

    const dom = new JSDOM(json.filters);
    const document = dom.window.document;
    const options = [ ...document.querySelectorAll('#generation option') ].map(el => el.getAttribute('value'));
    options.shift();

    return options;

}

async function fetchGenerationList(option, database) {

    const req = await fetch(`https://www.techpowerup.com/gpu-specs/?generation=${ option }&sort=name&ajax=1`);
    const json = await req.json();

    const dom = new JSDOM(json.list);
    const document = dom.window.document;
    const rows = [ ...document.querySelector('table').children[2].children];

    rows.forEach(r => {

        const vendor = r.children[0].getAttribute('class').replace(/^vendor-/, '');
        const name = r.children[0].children[0].innerHTML;
        const chip = r.children[1].innerHTML;
        const released = r.children[2].innerHTML;
        const bus = r.children[3].innerHTML;
        const memory = r.children[4].innerHTML;
        const clock = r.children[5].innerHTML;
        const memoryClock = r.children[6].innerHTML;
        const shadersTmusRops = r.children[7].innerHTML;

        database[name] = {

            vendor,
            name,
            chip,
            released,
            bus,
            memory,
            clock,
            memoryClock,
            shadersTmusRops,

        };

    });

}

async function fetchData() {

    const genOptions = await getGenerationOptions();
    const database = {};

    for (let i = 0; i < genOptions.length; i++) {

        console.log(`Fetching generation '${ genOptions[i] }' info`);
        await fetchGenerationList(genOptions[i], database);

    }

    return database;

}

function normalizeData(database) {

    const result = {};

    for (const name in database) {

        const {

            vendor,
            chip,
            released,
            bus,
            memory,
            clock,
            memoryClock,
            shadersTmusRops,

        } = database[name];

        const releaseYear = !isNaN(released) ? parseFloat(released) : null;

        let parsedMemory = null;
        let parsedMemType = null;
        if (memory.split(/,/g).length >= 2) {

            try {

                const tokens = memory.split(/,/g);
                const mb = math.unit(tokens[0]).toNumber('MB');
                const type = tokens[1].trim();

                parsedMemory = mb;
                parsedMemType = type;

            } catch (e) {

                console.error(e);
                console.error(`${ name }, ${ memory }`);
                console.error('');

            }

        }

        let parsedShaders = null;
        let parsedTmus = null;
        let parsedRops = null;
        try {

            [
                parsedShaders,
                parsedTmus,
                parsedRops,
            ] = shadersTmusRops.split(/[\\/]/g).map(s => parseInt(s));

        } catch (e) {

            console.error(e);
            console.error(`${ name }, ${ shadersTmusRops }`);
            console.error('');

        }

        let parsedClock = null;
        try {
            parsedClock = math.unit(clock).toNumber('MHz');
        } catch (e) {
            console.error(e);
            console.error(`${ name }, ${ clock }`);
            console.error('');
        }

        let parsedMemoryClock = null;
        try {
            parsedMemoryClock = math.unit(memoryClock).toNumber('MHz');
        } catch (e) {
            console.error(e);
            console.error(`${ name }, ${ memoryClock }`);
            console.error('');
        }

        result[name] = {

            name,
            chip,
            vendor,
            bus,

            released: releaseYear,

            memory: parsedMemory,
            memoryType: parsedMemType,
            memoryClock: parsedMemoryClock,

            clock: parsedClock,

            shaderUnits: parsedShaders,
            textureUnits: parsedTmus,
            renderUnits: parsedRops,

        };

    }

    return result;

}

module.exports = { fetchData, normalizeData };
