const and = require('./logic_functions/and');
const or = require('./logic_functions/or');
const _ = require('lodash');

module.exports = function parserFn(req, data) {
    validateInputs(req, data);
    req = parseReq(req);
    data = parseData(data);
    return processQuery(req, data);
}

function validateInputs(req, data){
     if(req === null) {
        throw new Error('Null being passed as request');
    }
    if(data === null){
        throw new Error('No dataset is provided for request ', req);
    }
}

function parseReq(req){
    try{
        return JSON.parse(req);
    } catch(err){
        throw new Error('Request not a valid JSON!');
    }
}

function parseData(data){
    try{
        return JSON.parse(data)
    } catch(err){
        throw new Error('Data is not a valid JSON!')
    }
}

function processQuery(req, data){
    let wrapper = [];

    if(_.isPlainObject(data)){
        wrapper.push(processDataPlainObj(req, data));
    } else {

    }
}

function processDataPlainObj(req, data){
    for(let i in req){
            if(i === "and"){
               let andRes = and(req[i], data);
            }

            else if(i === "or"){
               let orRes = or(req[i], data);
            }
        }
}