// copyIdl.js
const fs = require('fs');
const idl = require('./target/idl/zine.json');

fs.writeFileSync('./app/src/idl.json', JSON.stringify(idl));