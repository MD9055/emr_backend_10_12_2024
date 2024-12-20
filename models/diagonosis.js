// user.js

const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const diagonosisSchema = new mongoose.Schema({
    code: {
        type: String
    },
    desc: {
        type: String,
        index: 'text'
    }
}, {
    timestamps: true, 
    versionKey: false
});

diagonosisSchema.index({ desc: 'text' });
diagonosisSchema.plugin(aggregatePaginate);

// Create a model using the schema  
const diagonosis = mongoose.model('diagonosis', diagonosisSchema);

module.exports = diagonosis;
