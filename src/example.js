const { rendererToGpu } = require('./index.js');
const fs = require('fs');
const path = require('path');

const gpus = fs.readFileSync(path.join(__dirname, '../data/unmasked-renderer-webgl.txt'), 'utf8').trim().split(/\n/g).map(g => g.trim());


function pad(str, ct) {

    if (ct <= str.length) return str;
    return pad(str + ' ', ct);

}

gpus.forEach(g => {

    const match = rendererToGpu(g);
    console.log(pad(g, 80), ' -> ', match && match.name);

});
