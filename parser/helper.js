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

    returnData(data) {
        if(!_.isNil(data[0])){
            return data;
        }

        return undefined;
    }

}