// copyIdl.js
const fs = require('fs');
const idl = require('./target/idl/forum.json');

fs.writeFileSync('./app/src/idl.json', JSON.stringify(idl));
fs.copyFile('./target/types/forum.ts', './app/src/api/ForumType.ts', (err) => {
    if (err) throw err;
    console.log('File was copied to destination');
});