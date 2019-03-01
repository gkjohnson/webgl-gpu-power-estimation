const VB = require('../data/videocard-benchmark-gpus.json');
const TP = require('../data/techpowerup-gpus.json');
const { findMatch } = require('../umd/utils.js');

const vbKeys = Object.keys(VB);
const tpKeys = Object.keys(TP);

const data = [];
vbKeys.forEach(name => {

    let matches = findMatch(name, tpKeys);
    if (matches.score < 0.75) matches = null;
    else matches = matches.matches;

    data.push({
        name,
        matches: matches || []
    });

});

tpKeys.forEach(name => {

    let matches = findMatch(name, vbKeys);
    if (matches.score < 0.75) matches = null;
    else matches = matches.matches;

    data.push({
        name,
        matches: matches || []
    });

});

data.sort((a, b) => {

    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;

});

data.forEach(d => {

    console.log(d.name, ' : ', d.matches.join(', '));

});