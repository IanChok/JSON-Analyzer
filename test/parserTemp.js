const parser = require("../parser_main");
const fs = require('fs');
let tempData = JSON.parse(fs.readFileSync('./sample-json/quiz.json'));

let reqMathThenQ1AndQ2_OrSportsThenQ1 = '{"and":["quiz",{"or": ["maths", {"and": ["q1", "q2", "q3"]}, "sport", {"and": ["q1"]}]}]}';
let reqQuizThenSportThenQ1ThenQuestion = '{"and": ["quiz", {"and": ["sport", {"and": ["q1", {"and": ["question"]}]}]}]}';

parser(reqMathThenQ1AndQ2_OrSportsThenQ1, tempData);
// parser(reqQuizThenSportThenQ1ThenQuestion, tempData)
// console.log(result)

