const { getDetailedInfo } = require('../umd/index.js');
const { database } = require('../umd/database.js');
const fs = require('fs');
const path = require('path');

function pad(str, ct) {

    if (ct <= str.length) return str;
    return pad(str + ' ', ct);

}

const gpus = fs.readFileSync(path.join(__dirname, '../data/sample-unmasked-renderer-data.txt'), 'utf8').trim().split(/\n/g).map(g => g.trim());
gpus.forEach(g => {

    const match = getDetailedInfo(database, g);
    console.log(pad(g, 80), ' -> ', match && match.name);

});
