const parser = require("../parser_main");
const fs = require('fs');
let tempData = JSON.parse(fs.readFileSync('./sample-json/quiz.json'));


let result = parser('{"and": ["quiz", {"and": ["sport", {"and": ["q1", {"and": ["question"]}]}]}]}', tempData);

// console.log(result)

