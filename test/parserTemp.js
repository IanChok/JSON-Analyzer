const parser = require("../parser_main");
const fs = require('fs');
// let tempData = JSON.parse(fs.readFileSync('./sample-json/quiz.json'));
let transactionData = JSON.parse(fs.readFileSync('./sample-json/transaction.json'));
let peopleData = JSON.parse(fs.readFileSync('./sample-json/people.json'))

let reqMathThenQ1AndQ2_OrSportsThenQ1 = '{"and":["quiz",{"or": ["maths", {"and": ["q1", "q2", "q3"]}, "sport", {"and": ["q1"]}]}]}';
let reqQuizThenSportThenQ1ThenQuestion = '{"and": ["quiz", {"and": ["sport", {"and": ["q1", {"and": ["question"]}]}]}]}';
let reqWinnersThenNameEqToTest2Ailbhe = '{"and": ["winners", {"and": ["name", {"equal": ["Test2Ailbhe"]}]}]}';
let reqStatusAndWinnerThenCountryEqToGbAndCurrencyEqToEur = '{"and": ["status", "winners", {"and": ["country", {"equal": ["GB"]}, "currency", {"equal": ["EUR"]}]}]}';
let reqWinnerThenCountryEqToGbOrCA = '{"and": ["winners", {"and": ["country", {"equal": [{"or": ["GB", "CA"]}]}]}]}';
let reqFirstNameEqToNoellAndLastNameEqToBea = '{"and": ["first_name", {"equal": ["Noell"]}, "last_name", {"equal": "Bea"}]}'
let reqFirstNameEqToWillardOrLastNameEqToNonExist = '{"or": ["first_name", {"equal": ["Willard"]}, "last_name", {"equal": ["non_exist"]}]}'
let reqStatusAndLosers = '{"and":["status", "losers"]}';
let reqStatusAnd_WinnersThenName_LosersThenName = '{"and": ["status", "winners", {"and": ["name"]}, "losers", {"and": ["name"]}]}';
let reqStatusEqToLosers = '{"and": ["status", {"equal": ["FAIL"]}]}'
let reqFirstNameAndLastNameOfIdEqTo3 = '{"and": ["id", {"equal": ["3"]}, "first_name", "last_name"]}'


parser(reqFirstNameAndLastNameOfIdEqTo3, peopleData)