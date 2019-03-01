const { database } = require('../umd/database.js');
const { findMatch } = require('../umd/utils.js');
const fs = require('fs');
const path = require('path');

const gpus = fs.readFileSync(path.join(__dirname, '../data/sample-unmasked-renderer-data.txt'), 'utf8').trim().split(/\n/g).map(g => g.trim());
const dbKeys = Object.keys(database);
gpus.forEach(name => {

    let matches = findMatch(name, dbKeys);
    if (matches.score < 0.75) matches = [];
    else matches = matches.matches;

    console.log(name, ' : ', matches.join(', '));

});
