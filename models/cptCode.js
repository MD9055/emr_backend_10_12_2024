const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const cptcodeSchema = new mongoose.Schema(
    {
        code: {
            type: String
        },
        desc: {
            type: String,
            index: 'text'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

cptcodeSchema.index({ desc: 'text' });
cptcodeSchema.plugin(aggregatePaginate);

// Create a model using the schema
const cptCode = mongoose.model('cptCode', cptcodeSchema);

module.exports = cptCode;
