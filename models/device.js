const mongoose = require('mongoose');


const Schema = mongoose.Schema;

const deviceSchema = new Schema({
    ID: {type: String},
    creationDate: { type: Date, default: Date.now }
}, { collection: 'Device' });


const deviceModel = mongoose.model('Device', deviceSchema);

module.exports = deviceModel;
