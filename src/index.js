const gpuDatabase = require('../data/videocard-benchmark-gpus.json');

function extractValue(reg, str) {
    const matches = str.match(reg);
    return matches && matches[0];
}

function getVendorRenderer(gl) {

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {

        return null;

    }

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return { vendor, renderer };

}

function parseGpuInfo(vendor, renderer) {

    // Full card description and webGL layer (if present)
    const layer = extractValue(/(ANGLE)/g, renderer);
    const card = extractValue(/((NVIDIA|AMD|Intel)[^\d]*[^\s]+)/, renderer);

    const tokens = card.split(' ');
    tokens.shift();

    // Split the card description up into pieces
    // with brand, manufacturer, card version
    const manufacturer = extractValue(/(NVIDIA|AMD|Intel)/g, card);
    const cardVersion = tokens.pop();
    const brand = tokens.join(' ');
    const integrated = manufacturer === 'Intel';

    return {

        card,
        manufacturer,
        cardVersion,
        brand,
        integrated,
        vendor,
        renderer,
        layer,

    };

}

function getBasicInfo(gl = null) {

    gl = gl || document.createElement('canvas').getContext('webgl');

    const vr = getVendorRenderer(gl);
    return vr ? parseGpuInfo(vr.vendor, vr.renderer) : null;

}

function strToCompareArray(str) {

    return str.split(/\W+/g).map(c => c.trim().toLowerCase()).filter(c => c.length > 1);

}

function compareStr(a, b) {

    if (typeof a === 'string') a = strToCompareArray(a);
    if (typeof b === 'string') b = strToCompareArray(b);

    let tot = 0;
    for (let i = 0, l = a.length; i < l; i++) {

        if (b.includes(a[i])) tot++;

    }

    return tot / Math.min(a.length, b.length);

}

function rendererToGpu(renderer) {

    const gpuNames = Object.keys(gpuDatabase);
    let gpuName = null;
    let compare = -Infinity;

    const numMatches = /\w*\d\d\d+\w*/.exec(renderer);
    let numRegexp = null;
    if (numMatches) {
        numRegexp = new RegExp(`(^|\\W)${ numMatches[0] }(\\W|$)`, 'i');
    }

    const gpuArr = strToCompareArray(renderer);
    for (let i = 0, l = gpuNames.length; i < l; i++) {

        const name = gpuNames[i];
        if (numRegexp && !numRegexp.test(name)) continue;
        if (!numRegexp && /\d\d\d+/.test(name)) continue;

        const similarity = compareStr(name, gpuArr);
        if (similarity > compare) {

            compare = similarity;
            gpuName = gpuNames[i];

        }

    }

    return compare > 0.5 ? gpuDatabase[gpuName] : null;

}

function getDetailedInfo(gl = null) {

    gl = gl || document.createElement('canvas').getContext('webgl');

    const vr = getVendorRenderer(gl);
    if (!vr) return null;

    const { renderer } = vr;
    return rendererToGpu(renderer);

}

module.exports = { getDetailedInfo, getBasicInfo, rendererToGpu };
