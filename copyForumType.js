//copyfile.js
const fs = require('fs');

// destination will be created or overwritten by default.
fs.copyFile('./target/types/forum.ts', './app/src/api/ForumType.ts', (err) => {
    if (err) throw err;
    console.log('File was copied to destination');
});