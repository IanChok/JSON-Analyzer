const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

module.exports = async function readFileAsync(filePath) {
    return await readFile(filePath, 'utf8').then((data)=>{
        return JSON.parse(data);
    });
}