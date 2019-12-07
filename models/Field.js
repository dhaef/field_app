const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
    fieldName: {
        type: String,
        required: [true, 'Please add a name for this field']
    },
    sport: {
        type: String,
        required: true,
        enum: [
            'soccer',
            'football',
            'baseball',
            'basketball'
        ]
    },
    lat: {
        type: Number,
        required: true
    },
    lon: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Field', FieldSchema);