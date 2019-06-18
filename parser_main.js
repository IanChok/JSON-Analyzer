// const and = require('../logic_functions/and');
// const or = require('../logic_functions/or');
const lo = require('lodash');
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
    if (lo.isPlainObject(data)) {
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
    lo.forEach(data, (obj) => {
        console.log('process #: ', ++i);
        let temp = processReq(req, obj, cond, field);
        console.log('processDataArray => temp: ', temp)
        if (temp !== undefined) {
            console.log('temp !== undefined');
            wrapper.push(temp);
        }
    })

    console.log('wrapper: ', wrapper)
    if (wrapper.length === 0) {
        return [undefined];
    }

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
        if (lo.isPlainObject(value)) {
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
    lo.forEach(query, (val) => {
        if (data[field] === val) {
            matches = true;
            return;
        }
    })


    return matches;
}

function isFilter(input) {
    if (isLogicFn(input)) {
        for (let i in input) {
            if (i === "equal" || i === "greater" || i === "less") {
                return true;
            }
        }
    }

    return false;
}

function isLogicFn(input) {
    return input !== undefined && lo.isPlainObject(input)
}

//AND Function
function and(query, data) {
    console.log('and => query: ', query, '. data: ', data);
    let i = 0;
    let field = query[i];
    let fieldNext = query[i + 1];
    let resultObj = {};

    while (isFilter(fieldNext)) {
        console.log('(i =', i, ')', 'fieldNext is a filter: ', fieldNext);
        data = filterData(field, fieldNext, data, "and");
        console.log('data: ', data);
        if (isUndefined(data)) {
            return undefined;
        }
        i += 2;
        field = query[i];
        fieldNext = query[i + 1];
    }

    if (queryHasNoMoreRequests(i, query)) {
        return data;
    }

    while (i < query.length) {
        if (isLogicFn(fieldNext)) {
            console.log('(i =', i, ')', 'fieldNext is a logic fn: ', fieldNext);
            let temp = recurseWithNextLogicFn(fieldNext, data[field], "and", field);
            if (isUndefined(temp)) {
                return undefined;
            }
            console.log('recursive temp: ', temp);
            resultObj[field] = temp
            i += 2;
            field = query[i];
            fieldNext = query[i + 1];
        } else {

            if (isUndefined(data[field])) {
                return undefined;
            }

            console.log('is not a logic fn (', fieldNext, ')')
            resultObj[field] = getFieldValue(data[field]);
            console.log('(i =', i, ')', 'field: ', field, '. getFieldValue = ', getFieldValue(data[field]));
            i += 1
            field = query[i];
            fieldNext = query[i + 1];
        }
    }

    console.log('returnObj: ', util.inspect(resultObj, false, null, true));
    return resultObj;
}

function queryHasNoMoreRequests(i, query) {
    return i >= query.length;
}

function filterData(field, fieldNext, data, cond) {
    console.log('filterData => ')
    if (isEqual(fieldNext)) {
        console.log('fieldNext is equal: ', fieldNext);
        let processedData = processQuery(fieldNext, data, cond, field)[0];
        if (isUndefined(processedData)) {
            console.log('processedData is undefined')
            return undefined;
        }
        console.log('processedData: ', processedData);
        return processedData;

    }
    /* else if(isGreater(fieldNext) && isLess(fieldNext)) {
           //TODO
       } else if(isGreater(fieldNext)){
           //TODO
       } else if(isLess(fieldNext)){
           //TODO
       } */
    else {
        return undefined;
    }
}

function isEqual(obj) {
    return isFilterHelper(obj, "equal");
}

function isGreater(obj) {
    return isFilterHelper(obj, "greater")
}

function isLess(obj) {
    return isFilterHelper(obj, "less")
}

function isFilterHelper(obj, cond) {
    for (let i in obj) {
        if (i === cond) {
            return true;
        }
    }

    return false;
}

//OR Function
function or(query, data) {
    console.log('or => query: ', query, '. data: ', data);
    let c = {
        i: 0,
        field () {return query[this.i]},
        fieldNext () {return query[this.i + 1]},
        data
    }

    let resultObj = {};

    console.log('c.fieldNext: ', c.fieldNext())

    if (isFilter(c.fieldNext())) {
        filtered = filterData_OR(c, query);
        console.log('filtered = ', util.inspect(filtered, false, null, true));
        if(lo.isNil(filtered.data)){
            return undefined;
        }

        c = {...filtered};
    }

    console.log('No more filters!')

    if (queryHasNoMoreRequests(c.i, query)) {
        console.log('query has no more requests ')
        return c.data;
    }


    while (c.i < query.length) {
        console.log('(i = ', c.i, ') ')
        if (isLogicFn(c.fieldNext())) {
            console.log('fieldNext is logic function: ', c.fieldNext());
            let temp = processQuery(c.fieldNext(), c.data[c.field()], c.data, "or", c.field());
            console.log('temp: ', temp);
            if (!isUndefined(temp[0])) {
                console.log('temp is not undefined... breaking out of while loop')
                resultObj[c.field()] = temp;
                break;
            }
            c.i += 2;

        } else {
            console.log('fieldNext is Not a logic function')
            let temp = getFieldValue(c.data[c.field()]);
            console.log('temp: ', temp)
            if (!lo.isNil(temp)) {
                console.log('temp is not nill, breaking out of while loop')
                resultObj[c.field()] = temp;
                break;
            }
            
            c.i += 1;
        }
    }

    console.log('returning: ', util.inspect(resultObj, false, null, true))

    return resultObj;

    //-----
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
                if (lo.isPlainObject(value)) {
                    value = [value];
                }
                returnObj[field] = value;
                break;
            }
        }
    }

    if (lo.size(returnObj) === 0) {
        return undefined;
    }

    return returnObj;
}

function filterData_OR(c, query){
    let tempData = undefined;

    while (isFilter(c.fieldNext())) {
        if (lo.isNil(tempData)) {
            console.log('(i =', c.i, ')', 'fieldNext is a filter: ', c.fieldNext);
            tempData = filterData(c.field(), c.fieldNext(), c.data, "or");
            console.log('tempData: ', tempData);
        }

        c.i += 2;
    }

    return {} = {...c, data: tempData}

}



//Equal function
function equal(query, data, cond, field) {
    console.log('equalFn => query: ', query, '. data: ', data, '. Field: ', field)
    let req = getRequest(query[0]);
    if (isLogicOrFn(req)) {
        let orQuery = getLogicOrQuery(req);
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
            if (data[field] === req) {
                console.log('returning data!')
                return data;
            }
        }
    }
    console.log('equal Fn returning Undefined')
    return undefined;
}

function getRequest(input) {
    let temp = Number(input);
    if (!isNaN(temp)) {
        return temp;
    }

    return input;
}

function isLogicOrFn(input) {
    if (lo.isPlainObject(input)) {
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
        const val = getRequest(query[i]);
        if (valuesDoNotMatch(data, field, val)) {
            return undefined;
        }
    }
    console.log('returning Data! (equal and helper)')
    return data;
}

function equalOrHelper(query, data, field) {
    for (let i = 0; i < query.length; i++) {
        const val = getRequest(query[i]);
        if (valuesMatch(data, field, val)) {
            console.log('returning data! (equal or helper)')
            return data;
        }
    }

    return undefined;
}

function valuesDoNotMatch(data, field, val) {
    return data[field] !== val;
}

function valuesMatch(data, field, val) {
    return data[field] === val;
}