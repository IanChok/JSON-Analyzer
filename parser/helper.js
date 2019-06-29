const lo = require('lodash');


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
        if(!lo.isNil(data[0])){
            console.log('parsedResult => returning ', data)
            return data;
        }

        return [undefined];
    },

    verifyValue(val){
        if(!lo.isNil(val)){
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
                    return 'filter_field'
                }
            }

            return 'recurse'
        }
    },

    isUndefined(item) {
        if(lo.isArray(item)){
            return item[0] === undefined;
        }

        return item === undefined;
    }

}