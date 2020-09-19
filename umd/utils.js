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

    function toScoreTable(arr) {
      var str = '';
      str += "| | ".concat(arr.join(' | '), " |\n");
      str += "|---|".concat(arr.map(function () {
        return '---|';
      }).join(''), "\n");
      arr.forEach(function (name) {
        var row = '';
        row += "| **".concat(name, "** |");
        arr.forEach(function (name2) {
          var info = findMatch(name, [name2]);

          if (name === name2) {
            row += ' - |';
          } else if (info) {
            row += " ".concat(info.score.toFixed(4), " |");
          } else {
            row += ' fail |';
          }
        });
        row += '\n';
        str += row;
      });
      return str;
    }

    exports.findMatch = findMatch;
    exports.toScoreTable = toScoreTable;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=utils.js.map
