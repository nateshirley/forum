//copyfile.js
const fs = require('fs');

// destination will be created or overwritten by default.
fs.copyFile('./target/types/zine.ts', './app/src/api/ZineType.ts', (err) => {
    if (err) throw err;
    console.log('File was copied to destination');
});