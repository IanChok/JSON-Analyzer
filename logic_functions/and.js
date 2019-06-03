const _ = require('lodash');
const parse = require('../parser/parser_helper');

module.exports = function andFunction(query, data) {
    let returnObj = {};
    //one level
    for (let i = 0; i < query.length; i++) {
        let req = query[i];

        if (typeof req === 'string') {
            if(data[req] === undefined){
                return undefined;
            }
            returnObj[req] = data[req];
        }
        
    }

    return returnObj;
}
