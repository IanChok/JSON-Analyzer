const _ = require('lodash');
const and = require('../logic_functions/and');
const or = require('../logic_functions/or');

module.exports = {
    processQuery: function (req, data) {
        if (_.isPlainObject(data)) {
            return [this.processDataPlainObj(req, data)];
        } else {
            return this.processDataArray(req, data)
        }
    },

    processDataPlainObj: function (req, data) {
        return this.processReq(req, data);
    },

    processDataArray: function (req, data) {
        let wrapper = [];
        _.forEach(data, (obj) => {
            wrapper.push(this.processReq(req, obj));
        })

        return wrapper;
    },


    processReq: function (req, data) {
        for (let i in req) {
            if (i === "and") {
                let andRes = and(req[i], data);
                return andRes;
            } else if (i === "or") {
                let orRes = or(req[i], data);
                return orRes;
            }
        }
    }
}
