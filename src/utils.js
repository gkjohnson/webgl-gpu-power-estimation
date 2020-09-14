function strToCompareArray(str) {

    return str.split(/\W+/g).map(c => c.trim().toLowerCase());

}

function compareStr(a, b) {

    if (typeof a === 'string') a = strToCompareArray(a);
    if (typeof b === 'string') b = strToCompareArray(b);

    if (a.length > b.length) {

        const temp = a;
        a = b;
        b = temp;

    }
    // b is now the longer array.

    let matchedCount = 0;
    for (let ai = 0, al = a.length; ai < al; ai++) {

        for (let bi = 0, bl = b.length; bi < bl; bi++) {

            if (b[bi] === a[ai]) {

                ++matchedCount;
                break;

            } else if (bi > 0 && b[bi - 1] + b[bi] === a[ai] && b[bi - 1].length <= 3 && b[bi][0].match(/\d/)) {

                // If the model number has a space in the middle, still treat it as a matching token.
                matchedCount += 0.9;
                break;

            }
        }
    }

    const unmatchedTokens = a.length - matchedCount + b.length - matchedCount;
    const score = matchedCount / Math.min(a.length, b.length) - unmatchedTokens * 0.001;

    return score;

}

function findMatch(name, list) {

    let matches = null;
    let score = -Infinity;

    // We've seen samples of GPU names in both of these formats: "Radeon Pro WX 3200" and "Radeon Pro WX3200".
    // We consider a version number as having an optional 1-3 letter uppercase prefix followed by at least 3 digits,
    // and try to match them regardless of if there's a space between the uppercase prefix and the digits.
    const versionMatch = /(^|\W)([A-Z]{1,3})?\W*(\d\d\d+\w*)/.exec(name);
    let versionRegexp = null;
    if (versionMatch) {

        if (versionMatch[2] !== undefined) {

            // Matched something like "WX 3200" or "WX3200"
            versionRegexp = new RegExp(`(^|\\W)(${versionMatch[2]}\\W*)?${versionMatch[3]}(\\W|$)`, "i");

        } else {

            // Matched just the digits.
            versionRegexp = new RegExp(`(^|\\W|((^|\\W)[A-Z]{1,3}))${versionMatch[3]}(\\W|$)`, "i");

        }

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

export { findMatch };
