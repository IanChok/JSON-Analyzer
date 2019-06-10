// const and = require('../logic_functions/and');
// const or = require('../logic_functions/or');
const _ = require('lodash');
const util = require('util');

module.exports = function parserFn(req, data) {
    console.log('parser called')
    checkNullInputs(req, data);
    req = parseReq(req);
    return processQuery(req, data);
}

function checkNullInputs(req, data) {
    if (req === undefined) {
        throw new Error('Null being passed as request');
    }
    if (data === undefined) {
        console.log('data is null');
        throw new Error('No dataset is provided for request ', req);
    }
}

function parseReq(req) {
    try {
        return JSON.parse(req);
    } catch (err) {
        throw new Error('Request not a valid JSON!');
    }
}

function processQuery(req, data, cond, field) {
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
    let i = -1;
    _.forEach(data, (obj) => {
        console.log('process #: ', ++i);
        let temp = processReq(req, obj, cond, field);
        if (temp !== undefined) {
            wrapper.push(temp);
        }
    })

    console.log('Wrapper: ', util.inspect(wrapper, false, null, true))
    return wrapper;
}

function processReq(req, data, cond, field) {
    for (let i in req) {
        if (i === "and") {
            return and(req[i], data);
        } else if (i === "or") {
            return or(req[i], data);
        } else if (i === "equal") {
            return equal(req[i], data, cond, field);
        }
    }
}

function and(query, data) {
    let returnObj = {};
    let andObj = null;

    for (let i = 0; i < query.length; i++) {
        let field = query[i];
        let fieldNext = query[i + 1];

        if (isUndefined(data[field])) {
            console.log('isUndefined!')
            return undefined;
        }

        if (isLogicFn(fieldNext)) {
            console.log('isLogicFn');
            if (isLogicEqualFn(fieldNext)) {
                console.log('isLogicEqualFn');
                if (dataHasValueFromField(fieldNext, data, "and", field)) {
                    console.log('dataHasValueFromField');
                    andObj = data;
                    i += 1;
                } else {
                    console.log('data does NOT have value from field');
                    return undefined;
                }

            } else {
                let temp = recurseWithNextLogicFn(fieldNext, data[field], "and", field);
                if (isUndefined(temp)) {
                    return undefined;
                }
                returnObj[field] = temp
                i += 1;
            }

        } else {
            returnObj[field] = getFieldValue(data[field]);
        }
    }

    if (andObj !== null) {
        return andObj;
    }

    return returnObj;
}

function isUndefined(obj) {
    if (obj === undefined) {
        return true;
    }
    return false;
}

function isLogicFn(input) {
    return input !== undefined && _.isPlainObject(input)
}

function recurseWithNextLogicFn(reqNext, data, cond, field) {
    if (cond === 'and') {
        return recurse_AndFn(reqNext, data, field);
    }
}

function recurse_AndFn(reqNext, data, field) {
    let temp = processQuery(reqNext, data, "and", field);
    if (temp[0] === undefined) {
        return undefined;
    }
    return temp;
}

function getFieldValue(value) {
    if (value !== undefined) {
        if (_.isPlainObject(value)) {
            value = [value];
        }
    }
    return value;
}



//TODO
function or(query, data) {
    let returnObj = {};

    for (let i = 0; i < query.length; i++) {
        let field = query[i];
        let reqNext = query[i + 1];

        if (reqNext !== undefined && _.isPlainObject(reqNext)) {
            let temp = processQuery(reqNext, data[field], data, "or", field);
            if (temp[0] === undefined) {
                continue;
            }

            returnObj[field] = temp;
            break;

        } else {
            let value = data[field];
            if (value !== undefined) {
                if (_.isPlainObject(value)) {
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

function isLogicEqualFn(obj) {
    for (let i in obj) {
        if (i === 'equal') {
            return true;
        }
    }

    return false;
}

function dataHasValueFromField(reqNext, data, cond, field) {
    let temp = processQuery(reqNext, data, cond, field);

    if (temp[0] === undefined) {
        return undefined;
    }

    return true;
}


function dataMatchesOrQuery(query, field, data) {
    let matches = false;
   _.forEach(query, (val) => {
       if(data[field] === val){
           console.log('data mathces or query! returning true');
           matches = true;
           return;
       }
   })

   return matches;
}

function equal(query, data, cond, field) {
    console.log('equal reached. data = ', util.inspect(data, false, null, true));
    console.log('query: ', query);
    for (let i = 0; i < query.length; i++) {
        let val = query[i];
        console.log('val: ', val, '. field: ', field);  

        if (isLogicOrFn(val)) {
            console.log('Val: ', val, ' is a logic or Fn')
            let orQuery = getLogicOrQuery(val);
            console.log('logic orQuery: ', orQuery);
            if (!dataMatchesOrQuery(orQuery, field, data)) {
                console.log('data does not match orQuery!!. Returning undefined');
                return undefined;
            } else {
                return data;
            }
        } else {
            if (cond === "and") {
                // console.log('cond = and');
                if (data[field] !== val) {
                    // console.log('data[field] !== val, ')
                    // console.log(`data[${field}] (= ${data[field]}) !== ${val}`)
                    return undefined;
                }
            } else {
                if (data[field] === val) {
                    // console.log('dataField === val');
                    return data;
                }
            }
        }


    }
    // console.log('returning data!');
    return data;
}

function isLogicOrFn(input) {
    console.log('inside isLogicOrFn');
    if (_.isPlainObject(input)) {
        console.log('isPlainObject: ', input)
        for (let i in input) {
            console.log('i:  ', i);
            if (i === "or") {
                console.log('input is: "or". Returning true');
                return true;
            }
        }
    }
    return false;
}

function getLogicOrQuery(obj) {
    for (let i in obj) {
        return obj[i];
    }
}