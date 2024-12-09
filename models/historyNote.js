// user.js

const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const HistoryNoteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        doctor_id: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        chief_complaint: {
            type: String,
            required: true,
        },
        history_illness: {
            type: String,
            // required: true,
        },
        ros: {
            type: String,
            required: true,
        },
        social_history: {
            type: String,
            required: true,
        },
        allergies: {
            type: String,
            required: true,
        },
        medication: {
            type: String,
            required: true,
        },
        physical_exam: {
            type: Array,
            required: true,
        },
        medicationList:{
            type: Array,
            required: true,
        },
        physical_details: {
            type: String,
            // required: true,
        },
        diagnosis: {
            type: Array,
            required: true,
        },
        plan: {
            type: String,
            required: true,
        },
        cptCode: {
            type: Array,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

HistoryNoteSchema.plugin(aggregatePaginate);

// Create a model using the schema
const HistoryNote = mongoose.model('historynote', HistoryNoteSchema);

module.exports = HistoryNote;
