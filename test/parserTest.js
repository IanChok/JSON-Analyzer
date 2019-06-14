const server = require('../server');
const parser = require('../parser_main');
const expect = require('chai').expect;

let transactionPath = './sample-json/transaction.json';
let cakePath = './sample-json/cake.json';
let databasePath = './sample-json/database.json';
let peoplePath = './sample-json/people.json';
let quizPath = './sample-json/quiz.json';

describe('Querying Data', () => {
  let transactionData;
  let cakeData;
  let databaseData;
  let peopleData;
  let quizData;

  before(async () => {
    transactionData = await server(transactionPath)
    cakeData = await server(cakePath);
    databaseData = await server(databasePath);
    peopleData = await server(peoplePath)
    quizData = await server(quizPath);
  })

  describe('Checking typeof server() and typeof server() return', () => {
    it('should be a funtion', () => {
      expect(server).to.be.a('function');
    })

    it('should return a json object', async () => {
      expect(transactionData).to.be.an('object');
    })

  })

  describe('Checking wrong inputs to parser.js', () => {
    it('should throw Error for null request', () => {
      expect(parser).to.throw();
    })
  })


  describe('Checking NOT Undefined Data', () => {
    it('transaction, cake, database, people, and quiz data are NOT undefined', () => {
      expect(transactionData).to.not.be.undefined;
      expect(cakeData).to.not.be.undefined;
      expect(databaseData).to.not.be.undefined;
      expect(peopleData).to.not.be.undefined;
      expect(quizData).to.not.be.undefined;
    })
  })

  describe('Returning Filtered Data', () => {
    describe('Querying AND Requests', () => {
      let reqNonExist = '{"and": ["non_exist"]}';
      let reqStatus = '{"and": ["status"]}';
      let reqStatusAndLosers = '{"and":["status", "losers"]}';
      let reqFirstName = '{"and":["first_name"]}';
      let reqFirstNameAndLastName = '{"and": ["first_name", "last_name"]}';
      let reqQuizThenSportThenQ1ThenQuestion = '{"and": ["quiz", {"and": ["sport", {"and": ["q1", {"and": ["question"]}]}]}]}';
      let reqQuizThenSportThenQ1ThenNonExist = '{"and": ["quiz", {"and": ["sport", {"and": ["q1", {"and": ["non_exist"]}]}]}]}';
      let reqStatusAnd_WinnersThenName_LosersThenName = '{"and": ["status", "winners", {"and": ["name"]}, "losers", {"and": ["name"]}]}';
      let reqIdAnd_battersThenBatter = '{"and": ["id", "batters", {"and": ["batter"]}]}';

      it('should return [undefined] because "non_exist" field does not exist from transactionData', () => {
        expect(parser(reqNonExist, transactionData)).to.eql([undefined]);
        expect(parser(reqQuizThenSportThenQ1ThenNonExist, quizData)).to.eql([undefined]);
      })

      it('should return "status" field  from transactionData', () => {
        expect(parser(reqStatus, transactionData)).to.eql([{
          status: "SUCCESS"
        }]);
      })

      it('should return "status" and "losers" field from transactionData', () => {
        expect(parser(reqStatusAndLosers, transactionData)).to.eql([{
          status: "SUCCESS",
          losers: [{
            name: "noobmaster",
            country: "CA",
            amountLoss: "80.25",
            currency: "CAD"
          }]
        }])
      })

      it('should return all "first_name" fields of each object in the array from peopleData', () => {
        expect(parser(reqFirstName, peopleData)).to.eql([
          { first_name: "Jeanette" },
          { first_name: "Giavani" },
          { first_name: "Noell" },
          { first_name: "Willard" },
          { first_name: "Mooka" }
        ])
      })

      it('should return all "first_name" and "last_name" fields of each object in the array from peopleData', () => {
        expect(parser(reqFirstNameAndLastName, peopleData)).to.eql([
          { first_name: "Jeanette", last_name: "Penddreth" },
          { first_name: "Giavani", last_name: "Frediani" },
          { first_name: "Noell", last_name: "Bea" },
          { first_name: "Willard", last_name: "Valek" },
          { first_name: "Mooka", last_name: "Zinga"}
        ])
      })

      it('should return nested properties: Quiz -> Sport -> Q1 -> Question from quizData', () => {
        expect(parser(reqQuizThenSportThenQ1ThenQuestion, quizData)).to.eql([{
          quiz: [{
            sport: [{
              q1: [{
                question: "Which one is correct team name in NBA?"
              }]
            }]
          }]
        }])
      })

      it('should return multiple fields with their associated nested contents from transactionData', () => {
        expect(parser(reqStatusAnd_WinnersThenName_LosersThenName, transactionData)).to.eql([{
          status: "SUCCESS",
          winners: [
            { name: null },
            { name: "Test2Ailbhe" },
            { name: "omegazhenga" },
            { name: "pwnmaster" }
          ],
          losers: [
            { name: "noobmaster" }
          ]
        }])
      })
      it('should return multiple fields with their associted nested contents from cakeData', () => {
        expect(parser(reqIdAnd_battersThenBatter, cakeData)).to.eql([{
          id: "0001",
          batters: [{
            batter: [{
              id: "1001",
              type: "Regular"
            },
            {
              id: "1002",
              type: "Chocolate"
            },
            {
              id: "1003",
              type: "Blueberry"
            },
            {
              id: "1004",
              type: "Devil's Food"
            }
            ]
          }]
        },
        {
          id: "0002",
          batters: [{
            batter: [{
              id: "1001",
              type: "Regular"
            }]
          }]
        },
        {
          id: "0003",
          batters: [{
            batter: [{
              id: "1001",
              type: "Regular"
            },
            {
              id: "1002",
              type: "Chocolate"
            }
            ]
          }]
        }
        ])
      })
    })


    describe('Querying OR Requests', () => {
      let reqNonExistOrStatus = '{"or": ["non_exist", "status"]}';
      let reqStatusOrLosers = '{"or": ["status", "losers"]}';

      it('should return "status" field from transactionData', () => {
        expect(parser(reqStatusOrLosers, transactionData)).to.eql([{
          status: "SUCCESS"
        }]);
      })

      it('should return "status" field because "non_exist" field doesn\'t exist from transactionData', () => {
        expect(parser(reqNonExistOrStatus, transactionData)).to.eql([{
          status: "SUCCESS"
        }])
      })
    })

    describe('Querying AND and OR requsts', () => {
      let reqMathThenQ1AndQ2AndQ3_OrSportsThenQ1 = '{"and":["quiz",{"or": ["maths", {"and": ["q1", "q2", "q3"]}, "sport", {"and": ["q1"]}]}]}';
      let reqMathThenQ1AndQ2_OrSportsThenQ1 = '{"and":["quiz",{"or": ["maths", {"and": ["q1", "q2"]}, "sport", {"and": ["q1"]}]}]}';

      it('should return "sport" then "q1" field value', () => {
        expect(parser(reqMathThenQ1AndQ2AndQ3_OrSportsThenQ1, quizData)).to.eql([{
          quiz: [{
            sport: [{
              q1: [{
                question: "Which one is correct team name in NBA?",
                options: [
                  "New York Bulls",
                  "Los Angeles Kings",
                  "Golden State Warriros",
                  "Huston Rocket"
                ],
                answer: "Huston Rocket"
              }]
            }]
          }]
        }])
      })

      it('should return "math" then "q1" & "q2" field', () => {
        expect(parser(reqMathThenQ1AndQ2_OrSportsThenQ1, quizData)).to.eql([
          {
            quiz: [{
              maths: [{
                q1: [{
                  question: "5 + 7 = ?",
                  options: [
                    "10",
                    "11",
                    "12",
                    "13"
                  ],
                  answer: "12"
                }],
                q2: [{
                  question: "12 - 8 = ?",
                  options: [
                    "1",
                    "2",
                    "3",
                    "4"
                  ],
                  answer: "4"
                }]
              }]
            }]
          }
        ])
      })
    })

    describe('Querying EQUAL Requests', () => {      
      let reqStatusEqToLosers = '{"and": ["status", {"equal": ["FAIL"]}]}'
      let reqFirstNameEqToNoellAndLastNameEqToBea = '{"and": ["first_name", {"equal": ["Noell"]}, "last_name", {"equal": ["Bea"]}]}'
      let reqWinnersThenNameEqToTest2Ailbhe = '{"and": ["winners", {"and": ["name", {"equal": ["Test2Ailbhe"]}]}]}'
      let reqStatusAndWinnerThenCountryEqToGbAndCurrencyEqToEur = '{"and": ["status", "winners", {"and": ["country", {"equal": ["GB"]}, "currency", {"equal": ["EUR"]}]}]}';
      let reqWinnerThenCountryEqToGbOrCA = '{"and": ["winners", {"and": ["country", {"equal": [{"or": ["GB", "CA"]}]}]}]}';
      let reqFirstNameEqToWillardOrLastNameEqToNonExist = '{"or": ["first_name", {"equal": ["Willard"]}, "last_name", {"equal": ["non_exist"]}]}'
      let reqFirstNameEqToNonExistOrLastNameEqToBea = '{"or": ["first_name", {"equal": ["non_exist"]}, "last_name", {"equal": ["Bea"]}]}'

      let reqFirstNameAndLastNameOfIdEqTo3 = '{"and": ["id", {"equal": ["3"]}, "first_name", "last_name"]}'
      let reqNonExistFromIdEq4 = '{"and": ["id", {"equal": ["4"]}, "non_exist"]}';
      let reqIdEqTo4andIdEq3 = '{"and": ["id", {"equal": ["4"]}, "id", {"equal": ["3"]}]}'

      it('should return "[udefined]" with non-existing value from transactionData', () => {
        expect(parser(reqStatusEqToLosers, transactionData)).to.eql([undefined]);
      })

      it('should return "winner" which name has "Test2Ailbhe" from transacitonData', ()=> {
        expect(parser(reqWinnersThenNameEqToTest2Ailbhe, transactionData)).to.eql([{
          winners: [{
            name: "Test2Ailbhe",
            country: "MT",
            amountWon: "90.95",
            currency: "EUR"
        }]
        }])
      })

      it('should return "first_name" equal to "Noelle" and "last_name" equal to "Bea"', () => {
        expect(parser(reqFirstNameEqToNoellAndLastNameEqToBea, peopleData)).to.eql([
          {
            id: 3,
            first_name: "Noell",
            last_name: "Bea",
            email: "nbea2@imageshack.us",
            gender: "Female",
            ip_address: "180.66.162.255"
          }
        ])
      })

      it('should return "status" and "winner" fields which has "country" equal to "GB" and "curency" equal to "EUR"', () => {
        expect(parser(reqStatusAndWinnerThenCountryEqToGbAndCurrencyEqToEur, transactionData)).to.eql([{
          status: "SUCCESS",
          winners: [{
              name: null,
              country: "GB",
              amountWon: "396.00",
              currency: "EUR"
          }]
        }])
      })

      it('should return "winner" field which has "country" fields equal to "GB" or "CA" from transactionData', () => {
        expect(parser(reqWinnerThenCountryEqToGbOrCA, transactionData)).to.eql([{
          winners: [{
            name: null,
            country: "GB",
            amountWon: "396.00",
            currency: "EUR"
        }, {
            name: "omegazhenga",
            country: "GB",
            amountWon: "4.00",
            currency: "GBP"
          }, {
            name: "pwnmaster",
            country: "CA",
            amountWon: "80.25",
            currency: "CAD"
          }]
        }])
      })

      it('should return "first_name" equal to "Willard" from peopleData', () => {
        expect(parser(reqFirstNameEqToWillardOrLastNameEqToNonExist, peopleData)).to.eql([
          {
            id: 4,
            first_name: "Willard",
            last_name: "Valek",
            email: "wvalek3@vk.com",
            gender: "Male",
            ip_address: "67.76.188.26"
          }
        ])
      })

      it('should return "last_name" equal to "Bea" from peopleData', () => {
        expect(parser(reqFirstNameEqToNonExistOrLastNameEqToBea, peopleData)).to.eql([
          {
            id: 3,
            first_name: "Noell",
            last_name: "Bea",
            email: "nbea2@imageshack.us",
            gender: "Female",
            ip_address: "180.66.162.255"
          }
        ])
      })

      it('should return "first_name" and "last_name" of "id" equal to 3', () => {
        expect(parser(reqFirstNameAndLastNameOfIdEqTo3, peopleData)).to.eql([
            {first_name: "Noell", last_name: "Bea"}
        ])
      })
      
      it('should return [undefined] for nonsensical equals requests', () => {
        expect(parser(reqNonExistFromIdEq4, peopleData)).to.eql([undefined]);
        expect(parser(reqIdEqTo4andIdEq3, peopleData)).to.eql([undefined]);
      })
    })
/* 
   describe('Querying GREATER and LESS Requests', () => {
      let reqIdGreaterThan2 = '{"and": ["id", {"greater": ["2"]}]}';
      let reqIdLessThan4 = '{"and": ["id", {"less": ["4"]}]}';
      let reqIdGreaterThan2LessThan4 = '{"and":["id", {"greater": ["2"], "less": ["4"]}]}';
      let reqIdGreaterThan2Lessthan3 = '{"and":["id", {"greater": ["2"], "less": ["3"]}]}';
      let reqIdGreaterThan5OrLessThan3= '{"or":["id", {"greater": ["5"], "less": ["3"]}]}';
      let reqIdLessThan3GreaterThan1 = '{"or":["id", {"less": ["3"], "greater": ["1"]}]}';

      let reqAmountWonGreaterThan5 = '{"and": ["winners", {"and": ["amountWon", {"greater": ["5.00"]}]}]}';
      let reqAmountWonLessThan300 = '{"and": ["winners", {"and": ["amountWon", {"less": ["300.00"]}]}]}';
      let reqAmountWonGreaterThan5LessThan300 = '{"and": ["winners", {"and": ["amountWon", {"greater": ["5.00"], "less": ["300.00"]}]}]}';


      it('should return "id" greater than 2 from PeopleData', () => {
        expect(parser(reqIdGreaterThan2, peopleData)).to.eql([
          {
            "id": 3,
            "first_name": "Noell",
            "last_name": "Bea",
            "email": "nbea2@imageshack.us",
            "gender": "Female",
            "ip_address": "180.66.162.255"
          }, {
            "id": 4,
            "first_name": "Willard",
            "last_name": "Valek",
            "email": "wvalek3@vk.com",
            "gender": "Male",
            "ip_address": "67.76.188.26"
          }, {
            "id": 5,
            "first_name": "Mooka",
            "last_name": "Zinga",
            "email": "mZing@lgbtq.com",
            "gender": "Trans",
            "ip_address": "75.36.237.44"
          }
        ])
      })

      it('should return "id" equal to 3 from peopleData', () => {
        expect(parser(reqIdGreaterThan2LessThan4, peopleData)).to.eql([
          {
            "id": 3,
            "first_name": "Noell",
            "last_name": "Bea",
            "email": "nbea2@imageshack.us",
            "gender": "Female",
            "ip_address": "180.66.162.255"
          }
        ])
      })


  
      it('should return "id" less than 4 from PeopleData', () => {
        expect(parser(reqIdLessThan4, peopleData)).to.eql([
          {
            "id": 1,
            "first_name": "Jeanette",
            "last_name": "Penddreth",
            "email": "jpenddreth0@census.gov",
            "gender": "Female",
            "ip_address": "26.58.193.2"
          }, {
            "id": 2,
            "first_name": "Giavani",
            "last_name": "Frediani",
            "email": "gfrediani1@senate.gov",
            "gender": "Male",
            "ip_address": "229.179.4.212"
          }, {
            "id": 3,
            "first_name": "Noell",
            "last_name": "Bea",
            "email": "nbea2@imageshack.us",
            "gender": "Female",
            "ip_address": "180.66.162.255"
          }
        ])
      })

     it('should return [undefined] for "id" greater than 2 and less than 3 from peopleData', ()=> {
          expect(parser(reqIdGreaterThan2Lessthan3, peopleData)).to.eql([undefined])
      })

      it('should return "id" less than 3 from peopleData', ()=> {
        expect(parser(reqIdGreaterThan5OrLessThan3, peopleData)).to.eql([
          {
            "id": 1,
            "first_name": "Jeanette",
            "last_name": "Penddreth",
            "email": "jpenddreth0@census.gov",
            "gender": "Female",
            "ip_address": "26.58.193.2"
          }, {
            "id": 2,
            "first_name": "Giavani",
            "last_name": "Frediani",
            "email": "gfrediani1@senate.gov",
            "gender": "Male",
            "ip_address": "229.179.4.212"
          }
        ])
      })

      it('should return "id" equal to 2', () => {
        expect(parser(reqIdLessThan3GreaterThan1, peopleData)).to.eql([
          {
            "id": 2,
            "first_name": "Giavani",
            "last_name": "Frediani",
            "email": "gfrediani1@senate.gov",
            "gender": "Male",
            "ip_address": "229.179.4.212"
          }
        ])
      })


      it('should return "winner" fields which have "amountWon" fields greater than 5.00 from transactionData', ()=> {
          expect(parser(reqAmountWonGreaterThan5, transactionData)).to.eql([{
            winners: [{
              name: null,
              country: "GB",
              amountWon: "396.00",
              currency: "EUR"
          }, {
              name: "Test2Ailbhe",
              country: "MT",
              amountWon: "90.95",
              currency: "EUR"
          }, {
              name: "pwnmaster",
              country: "CA",
              amountWon: "80.25",
              currency: "CAD"
          }]
          }])
      })

      it('should return "winner" fields which have "amountWon" fields less than 300.00 from transactionData', ()=> {
        expect(parser(reqAmountWonLessThan300, transactionData)).to.eql([{
          winners: [{
            name: "Test2Ailbhe",
            country: "MT",
            amountWon: "90.95",
            currency: "EUR"
        }, {
            name: "omegazhenga",
            country: "GB",
            amountWon: "4.00",
            currency: "GBP"
        }, {
            name: "pwnmaster",
            country: "CA",
            amountWon: "80.25",
            currency: "CAD"
        }]
        }])
      })

      
      it('should return "winner" fields which have "amountWon" fields greater than 5.00 and less than 300.00 from transactionData', ()=> {
        expect(parser(reqAmountWonGreaterThan5LessThan300, transactionData)).to.eql([{
          winners: [{
            name: "Test2Ailbhe",
            country: "MT",
            amountWon: "90.95",
            currency: "EUR"
        }, {
            name: "pwnmaster",
            country: "CA",
            amountWon: "80.25",
            currency: "CAD"
        }]
        }])
      })
    }) 
 */
    /* describe('Querying DEEP requests', ()=> {
      let reqQuestion = '{"deep": [{"and": ["question"]}]}'
      let reqQuestionWithParents = '{"deep": [{"and": ["question"]}], "parents": true}';
      let reqQuestionAndAnswer = '{"deep": [{"and": ["question", "answer"]}]}'

      it('should return all "question" fields, regardless of their nested levels from quizData', () => {
        expect(parser(reqQuestion, quizData)).to.eql([{
          question: [
            "Which one is correct team name in NBA?",
            "5 + 7 = ?",
            "12 - 8 = ?"]}
        ])
      })

      it('should return all "question" fields with nested structure intact, regardless of their nested levels from quizData', () => {
        expect(parser(reqQuestionWithParents, quizData)).to.eql([{
          quiz: [{
            sport: [{
              q1: {
                question: "Which one is correct team name in NBA?"
              }
            }],
            maths: [{
              q1: [{
                question: "5 + 7 = ?"
              }],
              q2: [{
                question: "12 - 8 = ?"
              }]
            }]
          }]
        }])
      })

      it('should return all "question" and "answer" fields, regardless of their nested levels from quizData', () => {
        expect(parser(reqQuestionAndAnswer, quizData)).to.eql([
          { question: "Which one is correct team name in NBA?", answer: "Huston Rocket" },
          { question: "5 + 7 = ?", answer:  "12" },
          { question: "12 - 8 = ?", answer: "4"}
        ])
      })

    }) */

  })
})