const _ = require('./helper');
const lo = require('lodash');
const util = require('util');

module.exports = function parser(query, data) {
    query = JSON.parse(query);
    _.checkNullInputs(query, data);
    let req = {
        ...query,
        data
    };
    return parserHelper(req);
}

function parserHelper(req) {
    if (lo.isArray(req.data)) {
        const wrapper = [];
        lo.forEach(req.data, (dataObj) => {
            let temp = processQuery(dataObj)
            if (!lo.isNil(temp)) {
                wrapper.push(dataObj);
            }
        })
        console.log('wrapper: ', wrapper)

        return _.parsedResult(wrapper);

    } else {
        let parseResult = processQuery(req)
        console.log('parsedResult: ', parseResult)
        return _.parsedResult([parseResult])
    }
}

function processQuery(req) {
    for (const i of Object.keys(req)) {
        switch (i) {
            case 'and':
                const resu = and(req);
                console.log('resu: ', resu)
                return resu
            case 'or':
                return or(req);
            default:
                break;
        }
    }
}

// look into nest     filter data, use as new data     look for field existence. 
//[{and/or: ...}, {equal/greater/less: ...}, string]
function and(req) {
    let result = {};

    lo.forEach(req.and, (item) => {
        const type = _.getQueryType(item);

        switch (type) {
            case 'field':
                result[item] = getFieldValue({
                    item,
                    data: req.data
                })
                break;

            case 'filter field':
                return filterData(); //TODO:
            case 'recurse':
                return recurse({
                    item,
                    data: req.data
                })
        }
    })

    console.log('result: ', result)
    return result;
}

function getFieldValue(req) {
    let val = req.data[req.item];
    return _.verifyValue(val);
}

function filterData() {

}

function recurse() {

}

function or(req) {


}