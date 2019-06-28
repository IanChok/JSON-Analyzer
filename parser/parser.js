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
 * @param {Query, Data} req 
 */
function processQuery(req) {
    if (lo.isArray(req.data)) {
        const wrapper = [];
        lo.forEach(req.data, (dataObj) => {
            let temp = processQueryHelper(dataObj)
            if (!lo.isNil(temp)) {
                wrapper.push(dataObj);
            }
        })
        console.log('wrapper: ', wrapper)

        return _.parsedResult(wrapper);

    } else {
        let parseResult = processQueryHelper(req)
        console.log('parsedResult: ', parseResult)
        return _.parsedResult([parseResult])
    }
}

function processQueryHelper(req) {
    return (lo.has(req, 'and')? and(req) : or(req));
}


/**
 * Ensures each item is truthy in the array [...].
 * @param {Query, Data} req 
 * @example
 *  and({'and': ['fieldA', 'fieldB'], 'data': {'fieldA': 'valueA', 'fieldB': 'valueB'}});
 * @returns {Object} result that has properties requested by each item from data
 * @returns undefined if one item is falsey
 */
function and(req) {
    const result = {};
    let fail = false;

    lo.forEach(req.and, (item) => {
        let tempVal;
        let field;
        const type = _.getQueryType(item);

        switch (type) {
            case 'field':
                tempVal = getFieldValue({item, data: req.data});
                field = item;
                break;

            case 'filter_field':
                tempVal = filterData(item, req.data);
                field = item.field;
                break;

            case 'recurse':
                tempVal = recurse({item, data: req.data});
                field = item.field;
        }

        if (tempVal === undefined) {
            fail = true;
            return false;
        }

        result[field] = tempVal;
    })

    return (fail ? undefined : result)
}

function getFieldValue(req) {
    let val = req.data[req.item];
    return _.verifyValue(val);
}

/**
 * Filters the data based on the query filters
 * 
 * @param {Field, Equal/Greater/Less} filter
 * @param {Object} data
 * @example 
 *  filterData({"field": "foo", "equal": "blah"}, {data: ...})
 * 
 * @returns new {data: ...}
 */
function filterData(filter, data) {
    let tempData;

    if (lo.has(filter, 'equal')) {
        tempData = equal(filter, data);

    } else if (lo.has(filter, 'greater')) {
        //TODO: filter data with greater
    } else if (lo.has(filter, 'less')) {
        //TODO: filter data with less
    } else {
        throw new Error(`unrecognized filter: ${filter}`)
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
function recurse(filter, data) {
    const fieldVal = data[filter.field];

    if(fieldVal !== undefined) {
        const input = {};
        if(lo.has(filter, 'and')){
            input = {"and": filter.and, data: fieldVal}
        } else {
            input = {"or": filter.or, data: fieldVal}
        }

        return processQuery(input)
    }

    return undefined;
}

function or(req) {
    //TODO
}