const { fetchData, normalizeData } = require('./fetch-videocard-benchmark.js');
const fs = require('fs');
const path = require('path');

(async() => {

    console.log('Fetching videocardbenchmark.com data...');
    const originalData = await fetchData();

    console.log('Normalizing data...');
    const data = normalizeData(originalData);

    // write the files
    let filePath, jsonStr;
    filePath = path.join(__dirname, '../data/videocard-benchmark-gpus.json');
    jsonStr = JSON.stringify(originalData, null, 4);
    fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });

    filePath = path.join(__dirname, '../data/database.json');
    jsonStr = JSON.stringify(data, null, 4);
    fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });

    filePath = path.join(__dirname, '../src/database.js');
    const script =
        `const database = ${ jsonStr };` +
        'export { database }';
    fs.writeFileSync(filePath, script, { encoding: 'utf8' });

})();
