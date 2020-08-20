(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.GpuPowerEstimate = global.GpuPowerEstimate || {}));
}(this, function (exports) { 'use strict';

    function strToCompareArray(str) {
      return str.split(/\W+/g).map(function (c) {
        return c.trim().toLowerCase();
      });
    }

    function compareStr(a, b) {
      if (typeof a === 'string') a = strToCompareArray(a);
      if (typeof b === 'string') b = strToCompareArray(b);
      var matched = [];

      for (var i = 0, l = a.length; i < l; i++) {
        if (b.includes(a[i])) matched.push(a[i]);
      }

      var unmatchedTokens = a.length - matched.length + b.length - matched.length;
      var score = matched.length / Math.min(a.length, b.length) - unmatchedTokens * 0.001;
      return score;
    }

    function findMatch(name, list) {
      var matches = null;
      var score = -Infinity;
      var versionMatches = /\w*\d\d\d+\w*/.exec(name);
      var versionRegexp = null;

      if (versionMatches) {
        versionRegexp = new RegExp("(^|\\W)".concat(versionMatches[0], "(\\W|$)"), 'i');
      }

      var gpuArr = strToCompareArray(name);

      for (var i = 0, l = list.length; i < l; i++) {
        var _name = list[i];
        if (versionRegexp && !versionRegexp.test(_name)) continue;
        if (!versionRegexp && /\d\d\d+/.test(_name)) continue;
        var similarity = compareStr(_name, gpuArr);

        if (similarity > score) {
          score = similarity;
          matches = [_name];
        } else if (similarity === score) {
          matches.push(_name);
        }
      }

      return {
        matches: matches,
        score: score
      };
    }

    function extractValue(reg, str) {
      var matches = str.match(reg);
      return matches && matches[0];
    }

    function getVendorRenderer(gl) {
      var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

      if (!debugInfo) {
        return null;
      }

      var vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      var renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return {
        vendor: vendor,
        renderer: renderer
      };
    }

    function parseGpuInfo(vendor, renderer) {
      // Full card description and webGL layer (if present)
      var layer = extractValue(/(ANGLE)/g, renderer);
      var name = extractValue(/(NVIDIA|AMD|Intel)\D*\d*\S*/, renderer) || renderer;
      return {
        name: name.trim(),
        unmasked: {
          vendor: vendor,
          renderer: renderer
        },
        integrated: /Intel/i.test(name),
        layer: layer
      };
    }

    function getBasicInfo() {
      var glOrRenderer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var vendor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      glOrRenderer = glOrRenderer || document.createElement('canvas').getContext('webgl');
      var renderer = null;

      if (typeof glOrRenderer === 'string') {
        renderer = glOrRenderer;
      } else {
        var vr = getVendorRenderer(glOrRenderer);
        if (!vr) return null;
        renderer = vr.renderer;
        vendor = vr.vendor;
      }

      return parseGpuInfo(vendor, renderer);
    }

    function rendererToGpu(database, renderer) {
      var gpuNames = Object.keys(database);

      var _findMatch = findMatch(renderer, gpuNames),
          matches = _findMatch.matches,
          score = _findMatch.score;

      return score > 0.5 ? database[matches[0]] : null;
    }

    function getDetailedInfo(database) {
      var glOrRenderer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      glOrRenderer = glOrRenderer || document.createElement('canvas').getContext('webgl');
      var renderer = null;

      if (typeof glOrRenderer === 'string') {
        renderer = glOrRenderer;
      } else {
        var vr = getVendorRenderer(glOrRenderer);
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
