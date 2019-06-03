module.exports = function andFunction(query, data){
    let returnObj = {};

    for(let i = 0; i < query.length; i++){
        let tempResult;
        let field_req = query[i];
        
        if(typeof field_req === 'string'){
            tempResult = {[field_req] : data[field_req]};
            console.log('tempResult: ', tempResult);
        }
    }
}