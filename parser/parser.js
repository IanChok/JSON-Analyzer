let help = require('./helper');
let _ = require('lodash');

module.exports = function parser(query, data) {
    query = JSON.parse(query);
    help.checkNullInputs(query, data);
    let req = {...query, data};
    return parserHelper(req);
}

function parserHelper(req){
    if (_.isArray(req.data)) {
        const wrapper = [];
        _.forEach(req.data, (dataObj) => {
            let temp = processQuery(dataObj)
            if(!_.isNil(temp)){
                wrapper.push(dataObj);
            }
        })
        return help.returnData(wrapper);

    } else {
        let parseResult = processQuery(req)
        return help.returnData([parseResult])
    }
}

function processQuery(req) {
    for(const i of Object.keys(req)){
        switch(i) {
            case 'and': return and(req);
            case 'or': return or(req);
            default: break;
        }
    }
}

function and(req) {
    console.log('and: ', req)
}

function or(req) {
    console.log('or!')

}

function equal() {

}



