const _ = require('lodash');

module.exports = {
    checkNullInputs(req, data) {
        if (req === undefined) {
            throw new Error('Nothing is being passed as request');
        }
        if (data === undefined) {
            console.log('data is null');
            throw new Error('No dataset is provided for request ', req);
        }
    },

    parseReq(req) {
        try {
            return JSON.parse(req);
        } catch (err) {
            throw new Error('Request not a valid JSON!');
        }
    },

    parsedResult(data) {
        if(!_.isNil(data[0])){
            return data;
        }

        return undefined;
    },

    verifyValue(val){
        if(!_.isNil(val)){
            console.log('returning val: ', val)
            return val;
        }

        return undefined;
    },

    getQueryType(item){
        if(typeof item === 'string'){
            return 'field';
        } else {
            for(const key of Object.keys(item)){
                if(key === 'equal' || key === 'greater' || key === 'less'){
                    return 'filter field'
                }
            }

            return 'recurse'
        }
    }

}