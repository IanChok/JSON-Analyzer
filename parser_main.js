// const and = require('../logic_functions/and');
// const or = require('../logic_functions/or');
const _ = require('lodash');
const util = require('util');

module.exports = function parserFn(req, data) {
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

 function processQuery(req, data, cond, field, prevData) {
    for(let i in req){
        if(i === 'equal'){
            data = prevData;
        }
    }
    
    if (_.isPlainObject(data)) {
        return [processDataPlainObj(req, data, cond, field)];
    } else {
        return processDataArray(req, data, cond, field)
    }
}

function processDataPlainObj(req, data, cond, field) {
    return processReq(req, data, cond, field);
}

function processDataArray(req, data, cond, field) {
    let wrapper = [];
    _.forEach(data, (obj) => {
        wrapper.push(processReq(req, obj, cond, field));
    })

    return wrapper;
}

function processReq (req, data, cond, field) {
    for (let i in req) {
        if (i === "and") {
            return and(req[i], data);
        } else if (i === "or") {
            return  or(req[i], data);
        } else if(i === "equal"){
            return equal(req[i], data, cond, field);
        }
    }
}

function and(query, data) {
    let returnObj = {};

    for (let i = 0; i < query.length; i++) {
        let field = query[i]; 
        let reqNext = query[i+1];

        if (data[field] === undefined) {
            return undefined;
        }

        if(reqNext !== undefined && _.isPlainObject(reqNext)){
            let temp = processQuery(reqNext, data[field], "and", field, data);
            console.log('AND temp: ', util.inspect(temp, false, null, true));
            if(temp[0] === undefined){
                return undefined;
            }
            returnObj[field] = temp;
            i += 1;
        } else {
            let value = data[field];
            if (value !== undefined) {
                if(_.isPlainObject(value)){
                    value = [value];
                }
            }
            returnObj[field] = value;
        }
    }
    return returnObj;
}

//TODO
function or(query, data) {
    let returnObj = {};

    for (let i = 0; i < query.length; i++) {
        let field = query[i];
        let reqNext = query[i + 1];

        if (reqNext !== undefined && _.isPlainObject(reqNext)) {
            let temp = processQuery(reqNext, data[field], "or", field, data);
            if (temp[0] === undefined) {
                continue;
            }

            returnObj[field] = temp;
            break;

        } else {
            let value = data[field];
            if (value !== undefined) {
                if(_.isPlainObject(value)){
                    value = [value];
                }
                returnObj[field] = value;
                break;
            }
        }
    }

    if (_.size(returnObj) === 0) {
        return undefined;
    }
    return returnObj;
}

function equal(query, data, cond, field){
    console.log('equal reached. data = ', util.inspect(data, false, null, true));
    for(let i = 0; i < query.length; i++){
        let val = query[i];
        console.log('val: ', val, '. field: ', field);  
        if(cond === "and"){
            console.log('cond = and');
            if(data[field] !== val){
                console.log('data[field] !== val, ', data[field], ' ', val)
                return undefined;
            }
        } else {
            if(data[field] === val){
                console.log('dataField === val');
                return data;
            }
        }
    }
    console.log('returning data!');
    return data;
}