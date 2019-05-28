/* test/sum.js */

var parser = require('../parser');
var expect = require('chai').expect;

parser('./test.json').then((data)=>{
  console.log(data)
  console.log('typeof: ', typeof data);
});

describe('Reading Object', () => {
  it('parser should be a funtion', () => {
    expect(parser).to.be.a('function');
  })

  it('should return a json object', async ()=> {
      let result = await parser('./test.json');
      expect(result).to.be.an('object');
  })
})