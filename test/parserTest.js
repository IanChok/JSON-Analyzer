const server = require('../server');
const parser = require('../parser');
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
      let reqNonExist = '{and: ["non_exist"]}';
      let reqStatus = '{and: ["status"]}';
      let reqStatusAndLosers = '{and:["status", "losers"]}';
      let reqFirstName = '{and:["first_name"]}';
      let reqFirstNameAndLastName = '{and: ["first_name", "last_name"]}';
      let reqQuizThenSportThenQ1ThenQuestion = '{and: ["quiz", {and: ["sport", {and: ["q1", {and: "question"}]}]}]}';
      let reqStatusAnd_WinnersThenName_LosersThenName = '{and: ["status", "winners", {and: ["name"]}, "losers", {and: ["name"]}]}'

      
      it('reqNonExist should return null because "non_exist" field does not exist from transactionData', ()=> {
        expect(parser(reqNonExist, transactionData)).to.be.null;
      })

      it('reqStatus should return "status" field  from transactionData', () => {
        expect(parser(reqStatus, transactionData)).to.eql([{
          status: "SUCCESS"
        }]);
      })

      it('reqStatusAndLosers should return "status" and "losers" field from transactionData', () => {
        expect(parser(reqStatusAndLosers, transactionData)).to.eql([{
          status: "SUCCESS",
          losers: [{
            "name": "noobmaster",
            "country": "CA",
            "amountLoss": "80.25",
            "currency": "EUR"
          }]
        }])
      })

      it('reqFirstName should return all "first_name" fields of each object in the array from peopleData', () => {
        expect(parser(reqFirstName, peopleData)).to.eql([{
          first_name: ['Jeanette', 'Giavani', 'Noell', 'Willard']
        }])
      })

      it('reqFirstName and LastName should return all "first_name" and "last_name" fields of each object in the array from peopleData', () => {
        expect(parser(reqFirstNameAndLastName, peopleData)).to.eql([
          { first_name: "Jeanette", last_name: "Penddreth" },
          { first_name: "Giavani", last_name: "Frediani" },
          { first_name: "Noell", last_name: "Bea"},
          { first_name: "Willard", last_name: "Valek"}
        ])
      })
      
      it('reqQuizThenSportThenQ1ThenQuestion should return nested properties: Quiz -> Sport -> Q1 -> Question from quizData', () => {
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

      it('reqStatusAnd_WinnersThenName_LosersThenName should return multiple fields with their associated nested contents from transactionData', () => {
        expect(parser(reqStatusAnd_WinnersThenName_LosersThenName, transactionData)).to.eql([{
          status: "SUCCESS",
          winners: [{name: ["null", "Test2Ailbhe", "omegazhenga", "noobmaster"]}],
          losers:[{name: ["noobmaster"]}]
        }])
      })

      })


    describe('Querying OR Requests', () => {
      let reqNonExistOrStatus = '{or: ["non_exist", "status"]}';
      let reqStatusOrLosers = '{or: ["status", "losers"]}';

      it('reqStatusORLosers should return "status" field from transactionData', () => {
        expect(parser(reqStatusOrLosers, transactionData)).to.eql({
          status: "SUCCESS"
        });
      })

      it('reqNonExistOrStatus should return "status" field because "non_exist" field doesn\'t exist from transactionData', ()=> {
        expect(parser(reqNonExistOrStatus, transactionData)).to.eql([{
          status: "SUCCESS"
        }])
      })

      it('reqNonExistOrStatus')

    })

    describe('Querying DEEP requests', ()=> {
      let reqQuestion = '{deep: [{and: ["question"]}]}'
      let reqQuestionWithParents = '{deep: [{and: ["question"]}], parents: true}';
      let reqQuestionAndAnswer = '{deep: [{and: ["question", "answer"]}]}'

      it('reqQuestion should return all "question" fields, regardless of their nested levels from quizData', () => {
        expect(parser(reqQuestion, quizData)).to.eql([{
          question: [
            "Which one is correct team name in NBA?",
            "5 + 7 = ?",
            "12 - 8 = ?"]}
        ])
      })

      it('reqQuestion should return all "question" fields with nested structure intact, regardless of their nested levels from quizData', () => {
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

      it('reqQuestion should return all "question" and "answer" fields, regardless of their nested levels from quizData', () => {
        expect(parser(reqQuestionAndAnswer, quizData)).to.eql([
          { question: "Which one is correct team name in NBA?", answer: "Huston Rocket" },
          { question: "5 + 7 = ?", answer:  "12" },
          { question: "12 - 8 = ?", answer: "4"}
        ])
      })

    })

  })
})