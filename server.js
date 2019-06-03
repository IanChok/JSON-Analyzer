const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

module.exports = async function readFileAsync(filePath) {
    return await readFile(filePath, 'utf8').then((data)=>{
        try{
            return JSON.parse(data);
        } catch (err){
            throw new Error('Input data is not a valid JSON!')
        }
    });
}