(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.GpuPowerEstimate = global.GpuPowerEstimate || {}));
}(this, function (exports) { 'use strict';

    function strToCompareArray(str) {
      return str.split(/\W+/g).map(function (c) {
        return c.trim().toLowerCase();
      }).filter(function (c) {
        return c.length > 1;
      });
    }

    function compareStr(a, b) {
      if (typeof a === 'string') a = strToCompareArray(a);
      if (typeof b === 'string') b = strToCompareArray(b);
      var tot = 0;

      for (var i = 0, l = a.length; i < l; i++) {
        if (b.includes(a[i])) tot++;
      }

      return tot / Math.min(a.length, b.length);
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

    exports.findMatch = findMatch;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=utils.js.map
