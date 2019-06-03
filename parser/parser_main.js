// const and = require('../logic_functions/and');
// const or = require('../logic_functions/or');
const parseT = require('./parser_helper');
const _ = require('lodash');

module.exports = function parserFn(req, data) {
    checkNullInputs(req, data);
    req = parseReq(req);
    return parseT.processQuery(req, data);
}

function checkNullInputs(req, data){
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
