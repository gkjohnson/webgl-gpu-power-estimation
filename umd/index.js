(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.GpuPowerEstimate = global.GpuPowerEstimate || {}));
}(this, function (exports) { 'use strict';

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

    function findMatch(name, list) {

        let matches = null;
        let score = -Infinity;

        const versionMatches = /\w*\d\d\d+\w*/.exec(name);
        let versionRegexp = null;
        if (versionMatches) {
            versionRegexp = new RegExp(`(^|\\W)${ versionMatches[0] }(\\W|$)`, 'i');
        }

        const gpuArr = strToCompareArray(name);
        for (let i = 0, l = list.length; i < l; i++) {

            const name = list[i];
            if (versionRegexp && !versionRegexp.test(name)) continue;
            if (!versionRegexp && /\d\d\d+/.test(name)) continue;

            const similarity = compareStr(name, gpuArr);
            if (similarity > score) {

                score = similarity;
                matches = [name];

            } else if (similarity === score) {

                matches.push(name);

            }

        }

        return { matches, score };

    }

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

    exports.getDetailedInfo = getDetailedInfo;
    exports.getBasicInfo = getBasicInfo;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
