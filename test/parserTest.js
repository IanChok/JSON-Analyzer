/* test/sum.js */

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
      let reqStatus = '{and: ["status"]}';
      let reqStatusAndLosers = '{and:["status", "losers"]}';
      let reqFirstName = '{and:["first_name"]}'
      let reqFirstNameAndLastName = '{and: ["first_name", "last_name"]}'

      it('reqStatus should return "status" field  for transactionData', () => {
        expect(parser(reqStatus, transactionData)).to.eql([{
          status: "SUCCESS"
        }]);
      })

      it('reqStatusAndLosers should return "status" and "losers" field for transactionData', () => {
        expect(parser(reqStatusAndLosers)).to.eql([{
          status: "SUCCESS",
          losers: [{
            "name": "noobmaster69",
            "country": "CA",
            "amountLoss": "80.25",
            "currency": "EUR"
          }]
        }])
      })

      it('reqFirstName should return all "first_name" fields of each object in the array of peopleData', () => {
        expect(parser(reqFirstName)).to.eql([{
          first_name: ['Jeanette', 'Giavani', 'Noell', 'Willard']
        }])
      })

      it('reqFirstName and LastName should return all "first_name" and "last_name" fields of each object in the array of peopleData', () => {
        expect(parser(reqFirstNameAndLastName)).to.eql([
          { first_name: "Jeanette", last_name: "Penddreth" },
          { first_name: "Giavani", last_name: "Frediani" },
          { first_name: "Noell", last_name: "Bea"},
          { first_name: "Willard", last_name: "Valek"}
        ])
      })
    })

    describe('Querying OR Requests', () => {
      let reqStatusOrLosers = '{or:[\'status\', \'losers\']}';

      it('reqStatusORLosers should return "status" field for transactionData', () => {
        expect(parser(reqStatusOrLosers)).to.eql({
          status: "SUCCESS"
        });
      })

    })

  })
})