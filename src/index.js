import { findMatch } from './utils.js';

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
    const name = extractValue(/(NVIDIA|AMD|Intel)\D*\d*\S*/, renderer) || renderer;

    return {

        name: name.trim(),

        unmasked: {
            vendor,
            renderer,
        },

        integrated: /Intel/i.test(name),
        layer,

    };

}

function getBasicInfo(glOrRenderer = null, vendor = null) {

    glOrRenderer = glOrRenderer || document.createElement('canvas').getContext('webgl');

    let renderer = null;
    if (typeof glOrRenderer === 'string') {

        renderer = glOrRenderer;

    } else {

        const vr = getVendorRenderer(glOrRenderer);
        if (!vr) return null;

        renderer = vr.renderer;
        vendor = vr.vendor;

    }

    return parseGpuInfo(vendor, renderer);

}

function rendererToGpu(database, renderer) {

    const gpuNames = Object.keys(database);
    const { matches, score } = findMatch(renderer, gpuNames);

    return score > 0.5 ? database[matches[0]] : null;

}

function getDetailedInfo(database, glOrRenderer = null) {

    glOrRenderer = glOrRenderer || document.createElement('canvas').getContext('webgl');

    let renderer = null;
    if (typeof glOrRenderer === 'string') {

        renderer = glOrRenderer;

    } else {

        const vr = getVendorRenderer(glOrRenderer);
        if (!vr) return null;

        renderer = vr.renderer;

    }

    return rendererToGpu(database, renderer);

}

export { getDetailedInfo, getBasicInfo };
