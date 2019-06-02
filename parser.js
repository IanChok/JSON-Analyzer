const and = require('./logic_functions/and');
const or = require('./logic_functions/or');
module.exports = function parserFn(req, data) {
    if(req === null) {
        throw new Error('Null being passed as request');
    }
    if(data === null){
        throw new Error('No dataset is provided for request ', req);
    }
    validateReq(req);



    return;
}

function validateReq(req){
    try{
        JSON.parse(req);
    } catch(err){
        throw new Error('Request not a valid JSON');
    }

    return;
}
