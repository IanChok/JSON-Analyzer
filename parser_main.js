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

function isUndefined(obj) {
    if (obj === undefined) {
        return true;
    }
    return false;
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

function lookingForSpecificFieldValue(obj) {
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
        if (data[field] === val) {
            matches = true;
            return;
        }
    })


    return matches;
}

function isLogicFn(input) {
    return input !== undefined && _.isPlainObject(input)
}

function and(query, data) {
    let returnObj = {};
    let andObj = null;

    for (let i = 0; i < query.length; i++) {
        let field = query[i];
        let fieldNext = query[i + 1];

        if (isUndefined(data[field])) {
            return undefined;
        }

        if (isLogicFn(fieldNext)) {
            if (lookingForSpecificFieldValue(fieldNext)) {
                if (dataHasValueFromField(fieldNext, data, "and", field)) {
                    andObj = data;
                    i += 1;
                } else {
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



function or(query, data) {
    let returnObj = {};

    for (let i = 0; i < query.length; i++) {
        let field = query[i];
        let fieldNext = query[i + 1];

        if (isLogicFn(fieldNext)) {
            if (lookingForSpecificFieldValue(fieldNext)) {
                if (dataHasValueFromField(fieldNext, data, "or", field)) {
                    returnObj = data;
                    break;
                }
            } else {
                let temp = processQuery(fieldNext, data[field], data, "or", field);
                if (isUndefined(temp[0])) {
                    continue;
                }
                returnObj[field] = temp;
                break;
            }

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




function equal(query, data, cond, field) {
    let val = query[0];
    if (isLogicOrFn(val)) {
        let orQuery = getLogicOrQuery(val);
        if (!dataMatchesOrQuery(orQuery, field, data)) {
            return undefined;
        } else {
            return data;
        }
    } else {
        if (cond === "and") {
            return equalAndHelper(query, data, field);
        } else if (cond === "or") {
            return equalOrHelper(query, data, field);
        } else {
            if (data[field] === val) {
                return data;
            }
        }
    }
    return undefined;
}

function isLogicOrFn(input) {
    if (_.isPlainObject(input)) {
        for (let i in input) {
            if (i === "or") {
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

function equalAndHelper(query, data, field) {
    for (let i = 0; i < query.length; i++) {
        const val = query[i];
        if (data[field] !== val) {
            return undefined;
        }
    }
    return data;
}

function equalOrHelper(query, data, field) {
    for (let i = 0; i < query.length; i++) {
        const val = query[i];
        if (data[field] === val) {
            return data;
        }
    }

    return undefined;
}