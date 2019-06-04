const parser = require("../parser_main");
const fs = require('fs');
let tempData = JSON.parse(fs.readFileSync('./sample-json/quiz.json'));


let result = parser('{"and": ["quiz", {"and": ["sport", {"and": ["q1", {"and": ["asdf"]}]}]}]}', tempData);

// console.log(result)

