const VB = require('../data/videocard-benchmark-gpus.json');
const TP = require('../data/techpowerup-gpus.json');
const NC = require('../data/notebookcheck-gpus.json');
const { findMatch } = require('../umd/utils.js');

const vbKeys = Object.keys(VB);
const tpKeys = Object.keys(TP);
const ncKeys = Object.keys(NC);

let keys = null;
const data = [];

keys = [...tpKeys, ncKeys];
vbKeys.forEach(name => {

    let matches = findMatch(name, keys);
    if (matches.score < 0.75) matches = null;
    else matches = matches.matches;

    data.push({
        name,
        matches: matches || []
    });

});

keys = [...vbKeys, ncKeys];
tpKeys.forEach(name => {

    let matches = findMatch(name, keys);
    if (matches.score < 0.75) matches = null;
    else matches = matches.matches;

    data.push({
        name,
        matches: matches || []
    });

});

keys = [...vbKeys, tpKeys];
ncKeys.forEach(name => {

    let matches = findMatch(name, keys);
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
