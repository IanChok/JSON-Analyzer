const parser = require("../parser_main");
const fs = require('fs');
// let tempData = JSON.parse(fs.readFileSync('./sample-json/quiz.json'));
let transactionData = JSON.parse(fs.readFileSync('./sample-json/transaction.json'));

let reqMathThenQ1AndQ2_OrSportsThenQ1 = '{"and":["quiz",{"or": ["maths", {"and": ["q1", "q2", "q3"]}, "sport", {"and": ["q1"]}]}]}';
let reqQuizThenSportThenQ1ThenQuestion = '{"and": ["quiz", {"and": ["sport", {"and": ["q1", {"and": ["question"]}]}]}]}';
let reqWinnersThenNameEqToTest2Ailbhe = '{"and": ["winners", {"and": ["name", {"equal": ["Test2Ailbhe"]}]}]}';
let reqStatusAndWinnerThenCountryEqToGbAndCurrencyEqToEur = '{"and": ["status", "winners", {"and": ["country", {"equal": ["GB"]}, "currency", {"equal": ["EUR"]}]}]}';


parser(reqStatusAndWinnerThenCountryEqToGbAndCurrencyEqToEur, transactionData);

