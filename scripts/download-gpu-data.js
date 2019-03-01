const VB = require('./fetch-videocard-benchmark.js');
const TP = require('./fetch-techpowerup-specs.js');
const NC = require('./fetch-notebookcheck-specs.js');
const fs = require('fs');
const path = require('path');

(async() => {

    {

        console.log('Fetching videocardbenchmark.com data...');
        const data = await VB.fetchData();

        const filePath = path.join(__dirname, '../data/videocard-benchmark-gpus.json');
        const jsonStr = JSON.stringify(data, null, 4);
        fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });

    }

    {

        console.log('Fetching techpowerup.com data...');
        const data = await TP.fetchData();

        const filePath = path.join(__dirname, '../data/techpowerup-gpus.json');
        const jsonStr = JSON.stringify(data, null, 4);
        fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });

    }

	{

        console.log('Fetching notebookcheck.com data...');
        const data = await NC.fetchData();

        const filePath = path.join(__dirname, '../data/notebookcheck-gpus.json');
        const jsonStr = JSON.stringify(data, null, 4);
        fs.writeFileSync(filePath, jsonStr, { encoding: 'utf8' });

    }

})();
