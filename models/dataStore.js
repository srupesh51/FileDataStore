const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dataStoreSchema = new Schema({
    key: {type: String},
    value: {type: Schema.Types.Mixed},
    creationDate: { type: Date, default: Date.now }
}, { collection: 'DataStore' });

const dataStoreModel = mongoose.model('DataStore', dataStoreSchema);

module.exports = dataStoreModel;
