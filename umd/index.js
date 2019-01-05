(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.GpuPowerEstimate = global.GpuPowerEstimate || {}));
}(this, function (exports) { 'use strict';

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

    function rendererToGpu(database, renderer) {

        const gpuNames = Object.keys(database);
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

        return compare > 0.5 ? database[gpuName] : null;

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

    exports.getDetailedInfo = getDetailedInfo;
    exports.getBasicInfo = getBasicInfo;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
