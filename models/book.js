const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');
const autoIncrement = require('mongoose-auto-increment');

const Schema = mongoose.Schema;
autoIncrement.initialize(mongoose);

const bookSchema = new Schema({
    ID: {type: Number},
    name: { type: String },
    price: { type: Number },
    quantity: {type: Number},
    creationDate: { type: Date, default: Date.now }
}, { collection: 'Book' });


bookSchema.plugin(uniqueValidator);
bookSchema.plugin(autoIncrement.plugin, {model: 'bookModel', field: 'ID', startAt: 1, incrementBy: 1});

const bookModel = mongoose.model('Book', bookSchema);

module.exports = bookModel;