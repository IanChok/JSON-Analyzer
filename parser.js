const fs = require('fs');

fs.readFile('./sample-json/testTwo.json', 'utf8', (err, jsonStr) => {
    if(err){
        console.log('File read failure: ', err);
        return;
    }

    let jsonObj = JSON.parse(jsonStr);
    console.log(jsonObj)
})