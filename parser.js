module.exports = function parserFn(req, data) {
    if(req === null) {
        throw new Error('Null being passed as request');
    }
    if(data === null){
        throw new Error('No dataset is provided for request ', req);
    }

    validateReq(req);

    //TODO

    return;
}

function validateReq(req){
    try{
        JSON.parse(req);
    } catch(err){
        throw new Error('Request not a valid JSON: ', req);
    }

    return;
}