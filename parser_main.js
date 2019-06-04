// const and = require('../logic_functions/and');
// const or = require('../logic_functions/or');
const _ = require('lodash');
const util = require('util');

module.exports = function parserFn(req, data) {
    console.log('Parser reached');
    checkNullInputs(req, data);
    req = parseReq(req);
    return processQuery(req, data);
}

function checkNullInputs(req, data){
     if(req === undefined) {
        throw new Error('Null being passed as request');
    }
    if(data === undefined){
        console.log('data is null');
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

 function processQuery(req, data, req2) {
    if (_.isPlainObject(data)) {
        return [processDataPlainObj(req, data)];
    } else {
        return processDataArray(req, data)
    }
}

function processDataPlainObj(req, data) {
    return processReq(req, data);
}

function processDataArray(req, data) {
    let wrapper = [];
    _.forEach(data, (obj) => {
        wrapper.push(processReq(req, obj));
    })

    return wrapper;
}

function processReq (req, data) {
    for (let i in req) {
        if (i === "and") {
            return and(req[i], data);
        } else if (i === "or") {
            return  or(req[i], data);
        }
    }
}

 function isUndefined(req, data) {
        if (data[req] === undefined) {
            return true;
        }
}

function and(query, data) {
    let returnObj = {};

    for (let i = 0; i < query.length; i++) {
        let req = query[i]; 
        let reqNext = query[i+1];

        if (data[req] === undefined) {
            return undefined;
        }

        if(reqNext !== undefined && _.isPlainObject(reqNext)){
            let temp = processQuery(reqNext, data[req]);
            if(temp[0] === undefined){
                return undefined;
            }
            returnObj[req] = temp;
            i += 1;
        } else {
            let value = data[req];
            if (value !== undefined) {
                if(_.isPlainObject(value)){
                    value = [value];
                }
            }
            returnObj[req] = value;
        }
    }
    return returnObj;
}

//TODO
function or(query, data) {
    let returnObj = {};

    for (let i = 0; i < query.length; i++) {
        let req = query[i];
        let reqNext = query[i + 1];

        if (reqNext !== undefined && _.isPlainObject(reqNext)) {
            let temp = processQuery(reqNext, data[req]);
            if (temp[0] === undefined) {
                continue;
            }

            returnObj[req] = temp;
            break;

        } else {
            let value = data[req];
            if (value !== undefined) {
                if(_.isPlainObject(value)){
                    value = [value];
                }
                returnObj[req] = value;
                break;
            }
        }
    }

    if (_.size(returnObj) === 0) {
        return undefined;
    }
    return returnObj;
}