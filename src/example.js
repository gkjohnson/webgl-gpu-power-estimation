const { rendererToGpu } = require('./index.js');
const fs = require('fs');
const path = require('path');

const gpus = fs.readFileSync(path.join(__dirname, '../data/unmasked-renderer-webgl.txt'), 'utf8').trim().split(/\n/g).map(g => g.trim());

gpus.forEach(g => {

    console.time('test');
    const match = rendererToGpu(g);
    console.timeEnd('test');

    console.log(match, ' <- ', g);

});
