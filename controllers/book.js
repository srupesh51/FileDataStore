const book = require('../models/book');

exports.getRequest = (req,res) => {
    book.findOne({ID: req.body.bookID}).then((resData) => {
        res.status(200).json({data: {
            result: resData
          }
        });
    }).catch((err) => {
        return res.status(401).json({
            message: 'No book found with given ID'
        });
    });
};

exports.createRequest = (req,res) => {
    const bookData = new book({...req.body});
    bookData.save().then((resData) => {
        res.status(200).json({data: {
            result: resData
          }
        });
    }).catch((err) => {
        console.log(err);
        return res.status(401).json({
            message: 'Failed to create Book with given request'
        });
    });
};