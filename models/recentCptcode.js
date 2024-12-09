// user.js

const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const recentcptcodeSchema = new mongoose.Schema(
    {
        doctor_id: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
        },
        code_id: {
            type: mongoose.Types.ObjectId,
            ref: 'cptCode',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

recentcptcodeSchema.index({ desc: 'text' });
recentcptcodeSchema.plugin(aggregatePaginate);

// Create a model using the schema
const RecentCptCode = mongoose.model('recentcptCode', recentcptcodeSchema);

module.exports = RecentCptCode;
