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
const usedKeys = [];
const database = {};

const baseKeys = {
    name: null,
    names: null,
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
function joinData(name, tp, vb) {

    return {

        ...baseKeys,

        name,
        names: [tp.name, vb.name],
        vendor: tp.vendor,
        released: tp.released,
        memory: tp.memory || vb.memory,
        memoryType: tp.memoryType,

        clock: tp.clock || vb.clock,
        memoryClock: tp.memoryClock || vb.memoryClock,

        shaderUnits: tp.shaderUnits,
        renderUnits: tp.renderUnits,
        textureUnits: tp.textureUnits,

        performance: vb.performance,
        performance2d: vb.performance2d,
        type: vb.type,
        tdp: vb.tdp,

    };

}

for (const name in VB.data) {

    const ogDesc = VB.data[name];
    const { score, matches } = findMatch(name, TPKeys);

    if (score > 0.75) {

        const matchName = matches[0];
        const match = TP.data[matchName];
        usedKeys.push(matchName);
        database[name] = joinData(name, match, ogDesc);

    } else {

        database[name] = ogDesc;
        database[name].names = [name];

    }

}

for (const name in TP.data) {

    if (usedKeys.includes(name)) continue;

    const ogDesc = TP.data[name];
    const { score, matches } = findMatch(name, VBKeys);

    if (score > 0.75) {

        const matchName = matches[0];
        const match = VB.data[matchName];
        database[name] = joinData(name, ogDesc, match);

    }

}

const jsonStr = JSON.stringify(database, null, 4);

let filePath;
filePath = path.join(__dirname, '../data/database.json');
fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });

filePath = path.join(__dirname, '../src/database.js');
const script =
    `const database = ${ jsonStr };` +
    'export { database };';
fs.writeFileSync(filePath, script, { encoding: 'utf8' });
