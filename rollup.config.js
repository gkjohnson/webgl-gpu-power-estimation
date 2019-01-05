import path from 'path';

function createConfig(file) {

    return {
        input: path.join(__dirname, `./src/${ file }`),
        output: {
            name: 'GpuPowerEstimate',
            extend: true,
            format: 'umd',
            file: path.join(__dirname, `./umd/${ file }`),
            sourcemap: true
        }
    }

}

export default [createConfig('index.js'), createConfig('database.js')];