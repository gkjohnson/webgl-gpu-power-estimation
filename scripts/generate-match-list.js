const fs = require('fs');
const path = require('path');
const VB = Object.keys(require('../data/videocard-benchmark-gpus.json'));
const TP = Object.keys(require('../data/techpowerup-gpus.json'));
const NC = Object.keys(require('../data/notebookcheck-gpus.json'));
const { findMatch } = require('../umd/utils.js');

let readme = '';
appendMatches([
	...getMatchInfo(VB, [...TP, ...NC]),
	...getMatchInfo(TP, [...VB, ...NC]),
	...getMatchInfo(NC, [...TP, ...VB]),
]);

const filePath = path.join(__dirname, '../data/MATCHES.md');
fs.writeFileSync(filePath, readme, { encoding: 'utf8' });

function getMatchInfo(names, options) {

	return names.map(name => {

		const { score, matches } = findMatch(name, options);
		return { score, matches, name };

	});

}

function appendMatches(info) {

	readme += '## Totals\n';
	readme += 'Unmatched: `' + info.filter(m => !m.matches).length + '`\n\n';
	readme += 'Matched: `' + info.filter(m => !!m.matches).length + '`\n';

	readme += '## Unmatched\n';
	info
		.filter(m => !m.matches)
		.forEach(({ name }) => {

			readme += `- \`${ name }\`\n`;

		});



	readme += '## Matched\n';
	info
		.filter(m => !!m.matches)
		.forEach(({ name, score, matches }) => {

			readme += `### ${ name }\n`;

			readme += `\`${ name }\`\n`;

			if (matches.length !== 0) {

				readme += `##### score\n`;

				readme += `\`${ score }\``;

				if (score < 0.75) {

					readme += ' (below 0.75 threshold)';

				}

				readme += '\n';

				readme += `##### matches\n`;

				matches.forEach( n => {

					readme += `- \`${ n }\`\n`;

				} );

			} else {

				readme += '_'

			}

		});

}
