//copyfile.js
const fs = require('fs');

// destination will be created or overwritten by default.
fs.copyFile('./tests/helpers/tokenHelpers.ts', './app/src/api/tokenHelpers.ts', (err) => {
    if (err) throw err;
    console.log('File was copied to destination');
});