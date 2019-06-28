const _ = require('./helper');
const lo = require('lodash');
const util = require('util');

module.exports = function parser(query, data) {
    _.checkNullInputs(query, data);
    let req = {
        ...query,
        data
    };
    return processQuery(req);
}


/**
 * Processes data objects one at a time. 
 * @param {Object} req {Query, Data} 
 */
function processQuery(req) {
    console.log('processQuery (req) => ', req)
    let processNum = 0;
    if (lo.isArray(req.data)) {
        const wrapper = [];
        lo.forEach(req.data, (dataObj) => {
            console.log('data # ', processNum);
            let temp = processQueryHelper({...req, data: dataObj})
            if (!lo.isNil(temp)) {
                wrapper.push(temp);
            }

            processNum += 1;
        })
        console.log('wrapper: ',  _.parsedResult(wrapper))
        return _.parsedResult(wrapper);

    } else {
        let parseResult = processQueryHelper(req)
        console.log('parsedResult: ', _.parsedResult([parseResult]))
        return _.parsedResult([parseResult])
    }
}

function processQueryHelper(req) {
    console.log('processQueryHelper => ', req);
    return (lo.has(req, 'and')? and(req) : or(req));
}


/**
 * Ensures each item is truthy in the array [...].
 * @param {Object} req {Query, Data}
 * @example
 *  and({'and': ['fieldA', 'fieldB'], 'data': {'fieldA': 'valueA', 'fieldB': 'valueB'}});
 * @returns {Object} result that has properties requested by each item from data
 * @returns undefined if one item is falsey
 */
function and(req) {
    console.log('and => ...')
    const result = {};
    let fail = false;

    lo.forEach(req.and, (item) => {
        let tempVal;
        let field;
        const type = _.getQueryType(item);

        switch (type) {
            case 'field':
                console.log('type: field')
                tempVal = getFieldValue({item, data: req.data});
                field = item;
                break;

            case 'filter_field':
                console.log('type: filter_field')
                tempVal = filterData({filter: item, data: req.data});
                field = item.field;
                break;

            case 'recurse':
                console.log('type: recurse')
                tempVal = recurse({filter: item, data: req.data});
                field = item.field;
        }

        if (tempVal === undefined) {
            fail = true;
            return false;
        }

        result[field] = tempVal;
        console.log('result obj currently: ', result);
    })

    console.log('and => returning: ', result)
    return (fail ? undefined : result)
}

function getFieldValue(req) {
    console.log('getFieldValue => ...')
    console.log('item: ', req.item);
    let val = req.data[req.item];

    console.log('returning ',  _.verifyValue(val))
    return _.verifyValue(val);
}

/**
 * Filters the data based on the query filters
 * 
 * @param {Object} req {filter: {Field, Equal/Greater/Less}, data: {...}} 
 * @example 
 *  filterData({"field": "foo", "equal": "blah"}, {data: ...})
 * 
 * @returns new {data: ...}
 */
function filterData(req) {
    let tempData;

    if (lo.has(req.filter, 'equal')) {
        tempData = equal(req.filter, req.data);

    } else if (lo.has(req.filter, 'greater')) {
        //TODO: filter data with greater
    } else if (lo.has(req.filter, 'less')) {
        //TODO: filter data with less
    } else {
        throw new Error(`unrecognized filter: ${req.filter}`)
    }

    return (tempData === undefined? undefined : tempData);
}


/**
 * Filters data that has a field equal to a certain value
 * @param {Object} filter The field and value '{field: ..., equal: ...}'
 * @param {Object} data new {data: ...}, where field 'foo' equals 'blah'
 */
function equal(filter, data){
    if(lo.isString(filter.equal)){
        if(data[filter.field] === filter.equal){
            return data
        }
    } else {                                        //or: [..., ...]
        if(equal_options(filter, data)) {
            return data;
        }
    }

    return undefined;
}

function equal_options(filter, data){
    lo.forEach(filter.equal, (opt) => {
        if(data[filter.field] === opt){
            return true;
        }
    })

    return false;
}

/**
 * Processes query at the next nested level of a field
 * @param {Object} filter '{ field: top_level, and/or: [ nested_level_field ] }'
 * @param {Object} data 
 * @returns field value or filtered data at the nested level. 
 */
function recurse(req) {
    console.log('recurse => filter:  ', req.filter, '. data: ', req.data)
    const fieldVal = req.data[req.filter.field];

    if(fieldVal !== undefined) {
        let input;
        if(lo.has(req.filter, 'and')){
            input = {"and": req.filter.and, data: fieldVal}
        } else {
            input = {"or": req.filter.or, data: fieldVal}
        }

        return processQuery(input)
    }

    return undefined;
}

function or(req) {
    //TODO
}