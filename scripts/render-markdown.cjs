const fs = require('node:fs');
const { marked } = require('../js/vendor/marked.min.js');

const documents = JSON.parse(fs.readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify(documents.map(markdown => marked.parse(markdown))));
